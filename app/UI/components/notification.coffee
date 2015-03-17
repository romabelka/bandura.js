module.exports = React.createClass
  displayName: 'Notification'

  render: ->
    return null unless @props.notifications?
    content = @props.notifications.map((note) -> `(<span className='b-notification__item' key={note.timestamp}>{note.text}</span>)`)
    console.log '----', content
    return `(
      <div className="b-notification">
        {content}
      </div>
    );`

