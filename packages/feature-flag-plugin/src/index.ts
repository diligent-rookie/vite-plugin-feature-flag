import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";
import type { Plugin } from "vite";
import { DEFAULT_RULES } from "./constant";

interface Rule {
  rule: boolean;
  start: string;
  end: string;
  fileTypes: string[];
}

interface Comments {
  start: number;
  end: number;
}

interface FeatureFlagOptions {
  enforce?: 'pre' | 'post';
  include?: string|string[]|RegExp;
  exclude?: string|string[]|RegExp;
  rules?: Rule[];
}

function featureFlagPlugin(options?: FeatureFlagOptions): Plugin {
  const rules = options?.rules || DEFAULT_RULES;
  const filter = createFilter(options?.include || /\.(jsx?|tsx?|less|css|html)$/, options?.exclude);
  
  function findComments(code: string, fileType: string): Comments[] {
    const comments: Comments[] = [];
    
    for (const rule of rules) {
      if (!rule.rule) continue;
      if (!rule.fileTypes.includes(fileType)) continue;
      
      let startIndex = 0;
      while (true) {
        const startPos = code.indexOf(rule.start, startIndex);
        if (startPos === -1) break;
        
        const endPos = code.indexOf(rule.end, startPos + rule.start.length);
        if (endPos === -1) break;
        
        comments.push({
          start: startPos,
          end: endPos + rule.end.length,
        });
        
        startIndex = endPos + rule.end.length;
      }
    }
    
    return comments;
  }

  return {
    name: "vite-plugin-feature-flag",
    enforce: options?.enforce === 'post' ? 'post' : 'pre',
    transform(code: string, id: string) {
      if (!filter(id)) return null;
      
      const s = new MagicString(code);
      const fileType = id.split('.').pop() || '';
      const comments = findComments(code, fileType);
      
      // Remove comments in reverse order to maintain correct indices
      for (let i = comments.length - 1; i >= 0; i--) {
        s.remove(comments[i].start, comments[i].end);
      }
      
      const result = s.toString();
      const map = s.generateMap();
      return {
        code: result,
        map
      }
    }
  };
}

export default featureFlagPlugin;
