# soundcloud-to-dat

Download all music from a Soundcloud url and put it into a [Dat](https://datproject.org/).

```
npm install -g soundcloud-to-dat
```

Requires [youtube-dl](https://rg3.github.io/youtube-dl/) to be installed. On macOS you can do it using homebrew.

```
brew install youtube-dl
```

## Usage

``` sh
# will store content in dest (defaults to .) and share it on the dat network
soundcloud-to-dat [url] [dest?]
```

Running the above will print the Dat url the music is stored under.

You can open this url in [Beaker Browser](https://beakerbrowser.com) or clone it using Dat to listen to the music.

## License

MIT
