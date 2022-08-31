import React, { useState } from "react"

const NewQuestionImage = (props) => {
    const [photo, setPhoto] = useState()
    
    return <div className="new-question-photo">
      <div className="photo">
        {photo && <div className="preview-photo">
          <img src={URL.createObjectURL(photo)}></img>
        </div>}
        <input
          type="file"
          onChange={c => setPhoto(c.target.files[0])} 
        />
      </div>
      <button 
        className="add-question-photo" 
        onClick={() => props.onSubmit({ photo })}
      >
        Add question photo
      </button>
    </div>
}

export default NewQuestionImage

