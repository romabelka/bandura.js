noteLifeTime = 5000
module.exports = React.createClass
  displayName: 'Notification'
  getInitialState: ->
    notifications: []

  componentWillReceiveProps: (newProps)->
    @updateNotes(newProps.notifications)

  updateNotes: (incomingNotes)->
    notifications = (incomingNotes or @state.notifications).filter((note) -> Date.now() - note.timestamp < noteLifeTime)
    @setState notifications: notifications
    return unless notifications.length
    setTimeout(@updateNotes, notifications[notifications.length - 1].timestamp - Date.now() + noteLifeTime)


  render: ->
    content = @state.notifications.map((note) -> `(<span className='b-notification__item' key={note.timestamp}>{note.text}</span>)`)
    return `(
      <div className="b-notification">
        {content}
      </div>
    );`

