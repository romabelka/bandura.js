module.exports = React.createClass
  displayName: 'Tooltip'
  getInitialState: -> visible: no
  mouseOver: -> @setState visible: yes
  mouseOut: ->  @setState visible: no
  render: ->
    display = if @state.visible then 'block' else 'none'
    return `(<div className={this.props.className}
                  onClick={this.props.onClick}
                  onMouseOver={this.mouseOver}
                  onMouseOut={this.mouseOut}
    >
    <div style={{display:display}}>tooltip</div>
    {this.props.children}
    </div>
    )`