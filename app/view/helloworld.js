/** @jsx React.DOM */

var PlayPause = React.createClass({
    render: function() {
        return (
            <div className="play_btn">Play</div>
            )
    }
});

React.renderComponent(<PlayPause />, document.body);
