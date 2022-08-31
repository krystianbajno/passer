import React, { useState } from "react"

const NewQuestion = (props) => {
    const [description, setDescription] = useState();
    const [explanation, setExplanation] = useState();

    return <div className="new-question">
        <div className="description">
        <div>description</div>
        <textarea
          value={description}
          onChange={c => setDescription(c.target.value)} 
        />
        </div>
        <div className="explanation">
          <div>explanation</div>
          <textarea
            value={explanation} 
            onChange={c => setExplanation( c.target.value)} 
          />
        </div>
        <button 
          className="add-question" 
          onClick={() => props.onSubmit({ description, explanation })}
        >
          Add question
        </button>
    </div>
}

export default NewQuestion;