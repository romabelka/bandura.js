#=========================DISPETCHER=============
@controls = new Bacon.Bus()
@progress = new Bacon.Bus()
@activePlaylist = new Bacon.Bus()
@playerSettings = new Bacon.Bus()

progress.map((smTrack) ->
  {
  progress: smTrack.position / smTrack.duration
  loaded: smTrack.bytesLoaded / smTrack.bytesTotal
  }
).onValue((data) -> sendToStore(data))

#todo setVolume and mute


activePlaylist.combine(controls, (a,b) ->
  {
    playlist: a
    action: b
  }
).map((obj) ->
  switch obj.action
    when 'stop'
      soundManager.stopAll()
    when 'play'
      soundManager.pauseAll()
      soundManager.createSound(obj.playlist.getActiveTrack())
      soundManager.play(obj.playlist.getActiveTrack().id)
      Utils.extendImmutable obj.playlist, {status: 'isPlaying'}

    when 'pause'
      soundManager.pauseAll()
      Utils.extendImmutable obj.playlist, {status: 'Paused'}

    when 'nextTrack'
      controls.push('stop')
      activePlaylist.push(obj.playlist.nextTrack())
      controls.push('play')
      Utils.extendImmutable obj.playlist, {status: 'isPlaying'}


    when 'previousTrack'
      controls.push('stop')
      activePlaylist.push(obj.playlist.previousTrack())
      controls.push('play')
      Utils.extendImmutable obj.playlist, {status: 'isPlaying'}

).log('control').onValue((data) -> sendToStore(data))

