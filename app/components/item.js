import React from 'react';

export default class Item extends React.Component{
  constructor(props){
    super(props);
    this.state = props.data;
  }
  render(){
    var data;
    data = (
      <Item key = {this.state._id}
        name = {this.state.name}
        description = {this.state.description}
        category = {this.state.category}
        contents = {this.state.contents}>
      </Item>
    );
    console.log(data);
    return(
      <div>
        {data.props.name}
        <ul>
          <ul>
            <div>Name: {this.state.name}</div>
          </ul>

          <ul>
            <div>Description: {this.state.description}</div>
          </ul>

          <ul>
            <div>Category: {this.state.category}</div>
          </ul>

          <ul>
            <img className="img-responsive" src={this.state.contents} />
          </ul>
        </ul>
    </div>
    )
  }

}
