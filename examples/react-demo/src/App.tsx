import './App.css';

const App = () => {
  // @delete-start
  console.log('这段 log 不显示');
  // @delete-end
  console.log('这段 log 显示');
  return (
    <div>
      {/* @delete-start */}
      <h1>这段文本不显示</h1>
      {/* @delete-end */}
    </div>
  );
};

export default App;
