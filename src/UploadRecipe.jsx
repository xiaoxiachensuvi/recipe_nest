import { useRef, useEffect, useState } from 'react';
import axios from 'axios';

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
      //
      try {
        const transcriptionResponse = await axios.post(
          './transcription_example.json',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${VITE_OPENAI_API_KEY}`,
            },
          }
        );

        setResponse(transcriptionResponse.data);

        // https://api.openai.com/v1/completions
        const summaryResponse = await axios.post(
          './recipe_example.json',
          {
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Please summarise the text field as a recipe. The recipe should have a title of recipe name and two sections. the first section list down a table of all ingredients and the amount in a table, this section is titled with "Ingredient" wrapped in HTML tag <H2>. If the text contains a sequence of instructions, create a second section list down the steps, this section is title with "Steps" wrapped in HTML tag <H2>. The HTML is wrapped in <div class="recipe">, assuming it'll be put directly under <body> tag. Text = ${JSON.stringify(transcriptionResponse.data, null, 2)}`,
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
        console.log('response', summaryResponse);

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
    <div>
      <input
        ref={inputRef}
        type='file'
        accept='.mp3, .m4a'
        onChange={onChangeFile}
        style={{ display: 'block', marginTop: '20px' }}
      />
      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe }} />}

      {response && <div>{JSON.stringify(response, null, 2)}</div>}

    </div>
  );
}

export default UploadRecipe;
