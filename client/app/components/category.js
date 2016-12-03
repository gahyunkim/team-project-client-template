import React from 'react';
import Item from './item.js';

export default class Category extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      items: props.data.items,
      _id: props.data._id,
      showResults: false
    };
  }
  onClick() {
      this.setState({showResults: this.state.showResults === true ? false : true });
  }
  render(){
    var allItems =this.state.items.map((item)=>{
      return (<Item key={item._id} item={item} isCat={true}/>);})
    var firstFourItems;
    var lastItems;
    if(allItems.length >4){
      firstFourItems = allItems.slice(0, 4);
      lastItems = allItems.slice(4, allItems.length);
      return(
        <li className="list-group-item">
        <div className="panel panel-default">
        <div className="panel-heading">{this.state._id}</div>
        <div className="panel-body">
          {console.log(firstFourItems)}
          {firstFourItems}
          {this.state.showResults ? lastItems : null }
          <input className="btn" type="submit" value="More/Less" onClick={this.onClick.bind(this)} />
        </div>
        </div>
        </li>
      )
    }
    else{
      firstFourItems = allItems;
      lastItems = [];
      return(
        <li className="list-group-item">
        <div className="panel panel-default">
        <div className="panel-heading">{this.state._id}</div>
        <div className="panel-body">
          {firstFourItems}
        </div>
        </div>
        </li>
      )
    }
  }

}
