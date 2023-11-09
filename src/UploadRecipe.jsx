import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './UploadRecipe.css';

const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function UploadRecipe() {
  const inputRef = useRef();
  const [file, setFile] = useState();
  const [response, setResponse] = useState(null);
  const [recipe, setRecipe] = useState('');

  const onChangeFile = () => {
    setFile(inputRef.current.files[0]);
  };

  useEffect(() => {
    const fetchAudioFile = async () => {
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      // https://api.openai.com/v1/audio/transcriptions
      // ./transcription_example.json
      try {
        const transcriptionResponse = await axios.post(
          'https://api.openai.com/v1/audio/transcriptions',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${VITE_OPENAI_API_KEY}`,
            },
          }
        );

        setResponse(transcriptionResponse.data.text);

        // https://api.openai.com/v1/completions
        // ./recipe_example.json
        const summaryResponse = await axios.post(
          'https://api.openai.com/v1/completions',
          {
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Please summarise the text field as a recipe in HTML format. The HTML is wrapped in <div class="recipe">, assuming it'll be put directly under <body> tag. The recipe should have a title of recipe name and two sections. The title of the recipe is wrapped with <H2 class="recipe_title">.  The first section list down a table of all ingredients and the amount. This section is titled with "Ingredient" wrapped in HTML tag <H3 ="recipe-ingredient-title">. The table is wrapped with HTML <table class="recipe-ingredient">. If the text contains a sequence of instructions, create a second section list down the steps. This section is title with "Steps" wrapped in HTML tag <H2 class="recipe-steps-title">. The steps are listed in HTML tag <ol class="recipe-steps">. Text = ${JSON.stringify(transcriptionResponse.data, null, 2)}`,
            max_tokens: 1024,
            temperature: 0,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${VITE_OPENAI_API_KEY}`,
            },
          }
        );

        if (summaryResponse.data.choices && summaryResponse.data.choices.length > 0 && summaryResponse.data.choices[0].text) {
          const recipeText = summaryResponse.data.choices[0].text;
          setRecipe(recipeText);
        } else {
          console.error('No text found in summary response.');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchAudioFile();
  }, [file]);

  return (
    <div className="container">
      <input
        ref={inputRef}
        type='file'
        accept='.mp3, .m4a'
        onChange={onChangeFile}
        style={{ display: 'block', marginTop: '20px' }}
      />
      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe }} />}

      {response && (
        <div className="transcription-container">
          <div className="transcription"><strong>Transcription: </strong>{JSON.stringify(response, null, 2)}</div>
        </div>
      )}


    </div>
  );
}

export default UploadRecipe;
