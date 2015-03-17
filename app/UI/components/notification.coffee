module.exports = React.createClass
  displayName: 'Notification'

  render: ->
    content = @props.content + " Notification's text"
    return `(
      <div className="b-notification">
        <span className="b-notification__item ">{content}</span>
      </div>
    );`

