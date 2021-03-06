import React from "react";
import YearlyPane from  "./YearlyPane";
import MonthlyPane from "./MonthlyPane";
import YearsRangePane from "./YearsRangePane" ;
import YearlyNavigation from "./YearlyNavigation";
import MonthlyNavigation from "./MonthlyNavigation";
import YearsRangeNavigation from "./YearsRangeNavigation";
import BottomNavigation from "./BottomNavigation";
import CultureProvider from "./infrastructure/CultureProvider";
import Modes from "./infrastructure/Modes";

const ModeViews = {};

ModeViews[ Modes.Yearly ] = [ YearlyNavigation, YearlyPane, BottomNavigation ];
ModeViews[ Modes.Monthly ] = [ MonthlyNavigation, MonthlyPane, BottomNavigation ];
ModeViews[ Modes.Years ] = [ YearsRangeNavigation, YearsRangePane, BottomNavigation ];



class ContentPane extends React.Component{
  render() {
    let components = this.props.cases[ this.props.mode ].map(
          (c, i) => React.createElement( c, Object.assign( {},
                                                  this.props, {
                                                        key: "c" + i + this.props.mode,
                                                        style: {}
                                                      } ) )
    );
    return <div className="datepicker-pane" style={ this.props.style }>
              { components }
          </div>;
  }
}

function trimDate( date ){
  var splitted = CultureProvider.splitDate( date );
  return new Date( splitted.year, splitted.month, splitted.day );
}


class Calendar extends React.Component{
  constructor( props ) {
    super( props );
    this.switchMode = this.switchMode.bind( this );
    this.setTimeframe = this.setTimeframe.bind( this );
    this.setDate = this.setDate.bind( this );
    this.drillDown = this.drillDown.bind( this );
    this._trackOutsideClick = this._trackOutsideClick.bind( this );
    this._handleCloseKey = this._handleCloseKey.bind( this );
    this.state = this.initState( this.props, {} );
  }
  initState( props, state ){
    var newstate = {};
    newstate.mode = props.mode || state.mode || Modes.Monthly;
    if( props.selectedDate !== state.selectedDate || state.selectedDate === undefined ){
      newstate.selectedDate = trimDate( props.selectedDate || new Date() );
      newstate.timeframe = state.selectedDate;
    }
    return newstate;
  }
  setTimeframe( newDate ) {
    newDate = trimDate( newDate );
    this.setState( { timeframe: newDate } );
  }
  switchMode( mode ) {
    this.setState( { mode: mode } );
  }
  setDate( date, mode ){
    date = trimDate( date );
    this.setState( { timeframe: date , mode: mode || Modes.Monthly, selectedDate: date },
      ()=> { this.props.onDateChange( date, this.props.cultureProvider.formatted( date ) ); }
    );
  }
  drillDown( mode, timeframe ){
    this.setState( { mode: mode, timeframe: trimDate( timeframe ) } );
  }
  /*private sections*/
  _trackOutsideClick( e ) {
    if ( !this.props.visible ){
      return;
    }
    let target = e.target;
    let root = React.findDOMNode( this );
    while( target ){
      if( target === root ){
          return;
      }
      target = target.parentElement;
    }
    this.props.onHide( e );
  }
  _handleCloseKey( e ){
    e.keyCode === 27 && this.props.onHide( e );
  }
  componentWillReceiveProps( newProps ){
    this.setState( this.initState( newProps, this.state ) );
  }
  componentDidMount(){
    document.addEventListener( "mousedown", this._trackOutsideClick );
    document.addEventListener( "keydown", this._handleCloseKey );
  }
  componentWillUnmount() {
    document.removeEventListener( "mousedown", this._trackOutsideClick );
    document.removeEventListener( "keydown", this._handleCloseKey );

  }
  render() {
    if( !this.props.visible ){
      return null;
    }
    return <ContentPane {...this.props}
              mode={ this.state.mode }
              timeframe = { this.state.timeframe }
              selectedDate={ this.state.selectedDate }
              cases={ ModeViews }
              setTimeframe={ this.setTimeframe }
              setDate={ this.setDate }
              drillDown={ this.drillDown }
              switchMode ={ this.switchMode }/>;
  }
}

Calendar.defaultProps = {
  cultureProvider: new CultureProvider(),
  visible: false,
  style: {},
  onHide: function(){}
};

export { Calendar, CultureProvider };
