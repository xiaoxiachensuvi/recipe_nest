import {useRef, useEffect, useState} from 'react';
import axios from "axios";

const VITE_OPENAI_API_KEY= import.meta.env.VITE_OPENAI_API_KEY;
const model = "whisper-1";


function UploadRecipe() {
  const inputRef = useRef();
  const [file, setFile] = useState();
  const [response, setResponse] = useState(null);

  const onChangeFile = () => {
    setFile(inputRef.current.files[0]);
  };

  useEffect(() =>{
    const fetchAudioFile = async () => {
      if(!file){
        return;
      }

      const formData = new FormData();
      formData.append("model", model);
      formData.append("file", file);


      axios
        .post("https://api.openai.com/v1/audio/transcriptions", formData, {
          headers: {
            "Content-type": "multipart/form-data",
            Authorization: `Bearer ${VITE_OPENAI_API_KEY}`
          }
        })
        .then((res) => {
            console.log(res.data);
            setResponse(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchAudioFile();
  },[file]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".mp3, .m4a"
        onChange={onChangeFile}
        style={{ display: "block", marginTop: "20"}}
      />
    {response && <div>{JSON.stringify(response, null, 2)}</div>}
    </div>
  );
}

export default UploadRecipe;
