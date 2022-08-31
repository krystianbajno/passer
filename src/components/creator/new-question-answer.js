import React, { useState } from "react"

const NewQuestionAnswer = (props) => {
    const [description, setDescription] = useState(" ");
    const [isValid, setIsValid] = useState(true);
  
    return <div className="new-question-answer">
      <div className="is-valid">
        <label>is valid
          <input type="checkbox"
            defaultChecked={isValid}
            onChange={() => setIsValid(!isValid)} 
          ></input>
        </label>
      </div>
      <div className="description">
        <label>description</label><br/>
          <textarea
            value={description}
            onChange={c => setDescription(c.target.value)} 
          ></textarea>
      </div>
      <button 
        className="add-question-answer" 
        onClick={() => props.onSubmit({ description, isValid })}
      >
        Add question answer
      </button>
    </div>
  }

  export default NewQuestionAnswer;