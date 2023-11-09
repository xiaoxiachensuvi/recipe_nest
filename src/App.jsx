import { useState } from 'react';

import './App.css';

import UploadRecipe from "./UploadRecipe";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Recipe Nest</h1>
    <UploadRecipe></UploadRecipe>
    </>
);
}

export default App;
