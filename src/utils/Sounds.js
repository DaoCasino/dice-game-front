import {Howl, Howler} from 'howler'
import * as PIXI from 'pixi.js'

export default class Sounds {
    static _sounds = [];

    static init(map) {
        Howler.autoSuspend = false

        for (const key in map) {
            const sound = new Howl({
                src: [map[key]],
                volume: 1.0, loop: false, autoplay: false
            })

            Sounds._sounds[key] = sound
        }
    }

    static getVolume() {
        return Howler.volume()
    }

    static setVolume(value) {
        Howler.volume(value)
    }

    static mute() {
        Howler.mute(true)
    }

    static unmute() {
        Howler.mute(false)
    }

    static get(key) {
        const sound = Sounds._sounds[key]
        if (sound) {
            return sound
        }
        return null
    }

    static play(key, options) {
        const sound = Sounds._sounds[key]
        if (sound) {
            console.log('Play sound', key)

            if (options) {
                for (const key in options) {
                    sound[key](options[key])
                }
            }

            sound.stop()
            sound.play()

            return sound
        }

        console.log('Sound not found', key)

        const emulate = new PIXI.utils.EventEmitter()

        setTimeout(() => emulate.emit('end'), 100)

        return emulate
    }

    static stop(key) {
        const sound = Sounds._sounds[key]
        if (sound && sound instanceof Howl) {
            sound.stop()
            return sound
        }
        return null
    }

    static pause(key) {
        const sound = Sounds._sounds[key]
        if (sound && sound instanceof Howl) {
            sound.pause()
            return sound
        }
        return null
    }

    static resume(key) {
        const sound = Sounds._sounds[key]
        if (sound && sound instanceof Howl) {
            if (!sound.playing()) {
                sound.play()
            }
            return sound
        }
        return null
    }
}
