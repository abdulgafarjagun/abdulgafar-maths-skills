import React, { Component } from 'react';
import _ from 'lodash';


var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

const Stars = (props) => {

  return (
    <div className="col-5">
      {_.range(props.numberOfStars).map(i =>
        <i key={i} className="fa fa-star"></i>
      )}
    </div>
  );
}

const Button = (props) => {
  let button;
  switch(props.answerIsCorrect) {
    case true:
    button =
    <button className="btn btn-success" onClick={props.acceptAnswer}>
      <i className="fa fa-check"></i>
    </button>;
      break;
    case false:
    button =
    <button className="btn btn-danger" >
      <i className="fa fa-times"></i>
    </button>;
      break;
    default:
      button =
      <button className="btn"
              onClick={props.checkAnswer} 
              disabled={props.selectedNumbers.length === 0}>
        =
      </button>;
      break;
  }

  return (
    <div className="col-2">
      {button}
      <br /><br />
      <button className="btn btn-warning btn-sm" onClick={props.redraw}
              disabled={props.redraws === 0}>
        <i className="fa fa-refresh"></i> {props.redraws}
      </button>
    </div>
  );
}

const Answer = (props) => {
  return (
    <div className="col-5">
      {props.selectedNumbers.map((number, i) =>
        <span key={i} onClick={() => props.unselectNumber(number)}>
          {number}
        </span>
      )}
    </div>
  );
}

const Numbers = (props) => {
  const numberClassName = (number) => {
    if(props.usedNumbers.indexOf(number) >= 0) {
        return 'used';
    }
    if(props.selectedNumbers.indexOf(number) >= 0) {
      return 'selected';
    }
  }

  return (
    <div className="card text-center">
      <div>
        {Numbers.list.map((number, i) =>
          <span key={i} className={numberClassName(number)}
                onClick={() => props.selectNumber(number)}>
            {number}
          </span>
        )}
      </div>
    </div>
  );
}
Numbers.list = _.range(1, 10);

const DoneFrame = (props) => {
  return (
    <div className="text-center">
      <h2>{props.doneStatus}</h2>
      <button className="btn btn-secondary" onClick={props.resetGame}>
        Play Again
      </button>
    </div>
  );
}

function resetTimmer (countDown) {
  this.setState({ countDown });
  this.triggerTimmer();
}

function stopTimmer(){
  clearInterval(this.trigger);
}

class Timmer extends Component {
  constructor(props){
    super(props)
    this.state = {
      countDown: 60
    }
    this.triggerTimmer();
    resetTimmer = resetTimmer.bind(this);
    stopTimmer = stopTimmer.bind(this);
  }

  trigger = null;

  playTime = (countDown) => new Date(0, 0, 0, 0, 0, countDown).toLocaleTimeString();
  

  triggerTimmer = () => {
    this.trigger = setInterval(() => {
      if(this.state.countDown > 0) {
        this.setState((prevState) => ({
          countDown: prevState.countDown - 1
        }));
      } else {
        this.props.timeUp();
      }
    }, 1000);
  }

  render() {
    return(
      <div>
        Timmer: { this.playTime(this.state.countDown) }
      </div>
    );
  }
}



class Game extends Component {
  static randomNumber = () => 1 + Math.floor(Math.random()*9);
  
  static initialState = () => ({
    selectedNumbers: [],
    numberOfStars : Game.randomNumber(),
    usedNumbers: [],
    answerIsCorrect: null,
    redraws: 5,
    doneStatus: null,
    timeUp: false
  });

  state = Game.initialState();

  resetTimmerComponent(countDown){
    resetTimmer(countDown);
  }

  stopTimmerComponent(){
    stopTimmer();
  }

  resetGame = () => {
    this.setState(Game.initialState());
    this.resetTimmerComponent(60);
  }

  selectNumber = (clickedNumber) => {
    if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) { return}
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
    }));
  };
  
  unselectNumber = (clickedNumber) => {
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers
                                          .filter(number => number !== clickedNumber)
    }));
  }

  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect: prevState.numberOfStars ===
        prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
    }));
  };

  acceptAnswer = () => {
    this.setState(prevState => ({
      usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers : [],
      answerIsCorrect : null,
      numberOfStars : Game.randomNumber()
    }), this.updateDoneStatus );
  };

  redraw = () => {
    if(this.state.redraws === 0) { return; }
    this.setState(prevState => ({
      selectedNumbers : [],
      answerIsCorrect : null,
      numberOfStars : Game.randomNumber(),
      redraws : prevState.redraws - 1,
    }), this.updateDoneStatus );
  };

  possibleSolutions = ({numberOfStars, usedNumbers}) => {
    const possibleNumbers = _.range(1, 10).filter(number =>
        usedNumbers.indexOf(number) === -1
      );
      return possibleCombinationSum(possibleNumbers, numberOfStars);
  };

  timeUp = () => {
    this.setState({
      timeUp: true
    });
    this.updateDoneStatus();
  }

  updateDoneStatus = () => {
    this.setState(prevState => {
      if (prevState.usedNumbers.length === 9){
        this.stopTimmerComponent();
        return { doneStatus: 'Done. Nice!'}
      }
      if (prevState.redraws === 0 && !this.possibleSolutions(prevState)){
        this.stopTimmerComponent();
        return { doneStatus: 'Game Over!'}
      }
      if(prevState.timeUp){
        return { doneStatus: 'Time Up!'}
      }
    });
  }

  render() {
    const { 
      selectedNumbers, 
      numberOfStars,
      usedNumbers,
      answerIsCorrect,
      redraws,
      doneStatus
    } = this.state;

    return (
      <div className="container">
        <div className="row">
        <div className="col-8">
          <h3>Play Nine</h3>
        </div>
        <Timmer timeUp={this.timeUp} />
        </div>      
        
        <hr />
        <div className="row">
          <Stars numberOfStars={numberOfStars} />
          <Button selectedNumbers={selectedNumbers}
                  checkAnswer={this.checkAnswer}
                  acceptAnswer={this.acceptAnswer}
                  redraw={this.redraw}
                  redraws={redraws}
                  answerIsCorrect={answerIsCorrect} />
          <Answer selectedNumbers={selectedNumbers} 
                  unselectNumber={this.unselectNumber} />
          </div>
          <br />
          {doneStatus ?
            <DoneFrame resetGame={this.resetGame} doneStatus={doneStatus} /> : 
            <Numbers  selectedNumbers={selectedNumbers}
                    selectNumber={this.selectNumber} 
                    usedNumbers={usedNumbers} />
          }
      </div>
    );
  }
}


class App extends Component {
  render() {
    return (
      <div>
        <Game />
      </div>
    );
  }
}

export default App;
