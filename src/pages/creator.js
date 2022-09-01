import FileSaver from "file-saver"
import JSZip from "jszip"
import React from "react"
import NewQuestion from "../components/creator/new-question"
import NewQuestionAnswer from "../components/creator/new-question-answer"
import NewQuestionImage from "../components/creator/new-question-image"
import pJson from '../../package.json';

class Creator extends React.Component {
  state = {
    questions: {},
    answers: [],
    questions_data: [],
    report_name: "",
  }

  getPreviousQuestionId = () => {
    return Object.keys(this.state.questions).length ? Math.max(...Object.keys(this.state.questions)) : 0
  }

  addQuestion = (description, explanation) => {
    const addedQuestion = {
      description,
      explanation
    }

    const questions = this.state.questions
    questions[this.getPreviousQuestionId() + 1] = addedQuestion

    this.setState({
      ...this.state,
      questions: {...this.state.questions, ...questions}
    })
  }

  removeQuestion = (id) => {
    const newState = Object.assign({}, this.state)
    for (const item in newState.questions_data) {
      if (id == newState.questions_data[item].question_id) {
        delete newState.questions_data[item]
      }
    }

    for (const item in newState.answers) {
      if (id == newState.answers[item].question_id) {
        delete newState.answers[item]
      }
    }

    delete newState.questions[id]

    this.setState({...this.state, ...newState})
  }

  addQuestionAnswer = async (question_id, description, is_valid) => {
    const newState = Object.assign({}, this.state)
    
    const questionAnswer = {
      id: Math.floor(Math.random() * Date.now()),
      question_id,
      description,
      is_valid
    }

    newState.answers
      .push(questionAnswer)
    
    this.setState({...this.state, ...newState})
  }

  removeQuestionAnswer = (id) => {
    const newState = Object.assign({}, this.state)
    for (const item in newState.answers) {
      if (id == newState.answers[item].id) {
        delete newState.answers[item]
      }
    }
    this.setState({...this.state, ...newState})
  }

  addQuestionImage = async (question_id, image) => {
    const newState = Object.assign({}, this.state)

    const data = await new Response(image).blob()

    const extension = image.type
      .split('/')
      .pop()

    const fileName = Math.floor(Math.random() * Date.now()) + Math.floor(Math.random() * Date.now()) 
      + "." + extension

    const path = `data/${fileName}`

    const questionImage = {
      id: Math.floor(Math.random() * Date.now()),
      question_id,
      path,
      fileName,
      extension,
      data,
      originalImage: image,
      type: image.type,
      url: URL.createObjectURL(image)
    }

    newState.questions_data
      .push(questionImage)

    this.setState({...this.state, ...newState})
  }

  removeQuestionImage = (id) => {
    const newState = Object.assign({}, this.state)

    for (const item in newState.questions_data) {
      if (id == newState.questions_data[item].id) {
        delete newState.questions_data[item]
      }
    }

    this.setState({...this.state, ...newState})
  }

  downloadExam = async () => {
    const state = this.state
    state.questions_data = state.questions_data.filter(n => n)
    state.answers = state.answers.filter(n => n)

    let questionsData = `id,description,explanation\n` 
    Object.keys(state.questions).map(question => {
      if (question && this.state.questions[question]) {
        questionsData = questionsData +`"${question}","${this.state.questions[question].description.replace(/\"/g, "\'\'")}","${state.questions[question].explanation.replace(/\"/g, "\'\'")}"\n`
      }
    })

    let answersData = `id,question_id,description,is_valid\n`
    state.answers.map(answer => {
      if (answer) {
        answersData = answersData + `"${answer.id}","${answer.question_id}","${answer.description.replace(/\"/g, "\'\'")}","${answer.is_valid}"\n`
      }
    })

  
    let questionsImagesData = `id,question_id,path\n` 
    state.questions_data.map(image => {
      if (image) {
        questionsImagesData = questionsImagesData + `"${image.id}","${image.question_id}","${image.path}"\n`
      }
    })

    const zip = new JSZip();
    zip.file("questions.csv", questionsData)
    zip.file("answers.csv", answersData)
    zip.file("questions_data.csv", questionsImagesData)
    const zipData = zip.folder("data")


    console.log(state.questions_data)
    for (const image of state.questions_data) {
        zipData.file(image.fileName, new Blob([image.data]))
    }

    zip.generateAsync({type: "blob"}).then(zipFile => {
        FileSaver.saveAs(zipFile, state.report_name + ".zip")
    })
  }

  render = () => 
    <div className="creator">
      <h1>Passer Creator {pJson.version}</h1>
      <h3>Create your questions, then export them and import into the Passer ;) Gl Hf</h3>
      <a href="/">Quiz</a>

      <div className="questions">
          <h2>Questions:</h2>
          {Object.keys(this.state.questions).map(question => 
            <div className="question" id={`question-${question}`}>
              <h3>Question:</h3>
              <p><b>id:</b> {question}</p>
              <p><b>description:</b><br/> {this.state.questions[question].description}</p>
              <p><b>explanation:</b><br/> {this.state.questions[question].explanation}</p>
              <div className="question-answers">
                <h3>Answers:</h3>
                {this.state.answers.filter(item => item.question_id == question).map(item => {
                  return <div className="question-answer">
                    <div>description: {item.description}</div>
                    <div>is valid: <span style={{color: item.is_valid ? 'lime' : 'red'}}>{item.is_valid ? "yes" : "no"}</span></div>
                    <button onClick={() => this.removeQuestionAnswer(item.id)}>Delete</button>
                  </div>
                })}
              </div>
              <div className="question-images">
                <h3>Images:</h3>
                {this.state.questions_data.filter(item => item.question_id === question).map(item => {
                    return <div className="question-image">
                        <div>Path: {item.path}</div>
                        <img src={item.url}></img><br/>
                        <button onClick={() => this.removeQuestionImage(item.id)}>Delete image</button>
                    </div>
                })}
              </div>
              <div className="control-panel">
                <div className="add-answers">
                  <b>Add answers</b>
                  <NewQuestionAnswer onSubmit={
                    p => {
                      this.addQuestionAnswer(question, p.description, p.isValid)}
                  }/>
                </div>
                <div className="add-photos">
                  <b>Add photos</b>
                  <NewQuestionImage onSubmit={
                    p => {
                      this.addQuestionImage(question, p.photo)
                    }
                  }/>
                </div>
              </div>
              <button onClick={() => this.removeQuestion(question)}>Delete</button>
            </div>
          )}
       </div> 
       <div className="control-panel">
          <NewQuestion onSubmit={(p) => this.addQuestion(p.description, p.explanation)}/>
          <div className="report">
            <p>download exam format</p>
            <input onChange={(name) => {this.setState({...this.state, report_name: name.target.value})}} 
              type="text" 
              value={this.state.report_name} 
              placeholder="Name"
              title="Name">
            </input>
            <button onClick={() => this.downloadExam()}>Download</button>
          </div>
       </div> 
    </div>
}

export default Creator;
