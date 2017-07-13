#!/usr/bin/env node

var proc = require('child_process')
var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var hyperdrive = require('hyperdrive')
var mutexify = require('mutexify')
var hyperdiscovery = require('hyperdiscovery')

var dest = process.argv[3] || '.'
var music = path.join(dest, 'youtube-dl')
var template = fs.readFileSync(path.join(__dirname, 'index.html'))
var archive = hyperdrive('dat')
var mutex = mutexify()
var all = []

var url = process.argv[2]

if (!url) {
  console.error('Usage: soundcloud-to-dat [url] [dest?]')
  process.exit(1)
}

archive.on('ready', function () {
  console.log('Scraping\n\n  ' + url + '\n\nto\n\n  dat://' + archive.key.toString('hex') + '\n')
  hyperdiscovery(archive, {live: true})
  archive.readFile('music.json', 'utf-8', function (_, data) {
    if (data) all = JSON.parse(data)
    archive.readFile('index.html', 'utf-8', function (_, html) {
      if (html !== template) archive.writeFile('index.html', template)
      download(url, onfile, done)
    })
  })
})


function onfile (name) {
  var hash = crypto.createHash('sha256').update(name).digest()
  var prefix = []

  for (var i = 0; i < 2; i++) {
    var n = hash[i]

    for (var j = 0; j < 4; j++) {
      var r = n & 3
      prefix.push(r)
      n -= r
      n /= 4
    }
  }

  var output = 'music/' + prefix.join('/') + '/' + name

  all.push({
    name: name,
    path: output,
    url: url
  })

  mutex(function (release) {
    fs.createReadStream(path.join(music, name)).pipe(archive.createWriteStream(output)).on('finish', function () {
      archive.writeFile('music.json', JSON.stringify(all, null, 2), function () {
        console.log('Added', name)
        release()
      })
    })
  })
}

function done (err) {
  if (err) {
    console.error(err.message)
    console.error('Download failed. Do you have youtube-dl installed? brew install youtube-dl')
    process.exit(1)
    return
  }
  console.log('Added all music')
}

function download (url, onfile, cb) {
  fs.mkdir(music, function () {
    var c = proc.spawn('youtube-dl', [url, '--quiet'], {cwd: music, stdio: 'inherit'})
    var emitted = null

    c.on('error', cb)
    c.on('exit', function (code) {
      if (code) return cb(new Error('Bad exit code: ' + code))
      cb(null)
    })
    fs.watch(music, onchange)

    function onchange (event, name) {
      if (!/\.part$/.test(name)) {
        if (emitted === name) return
        emitted = name
        onfile(name)
      }
    }
  })
}
