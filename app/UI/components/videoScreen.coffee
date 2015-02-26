module.exports = React.createClass
  displayName: 'videoScreen'
  getInitialState: ->
    visible: false

  close: -> @setState visible:false

  render: ->

    return `(
    <div className="b-video">

    </div>
    )`