import fetch, { Headers } from 'node-fetch'
import { json } from 'body-parser'
import * as FormData from 'form-data'
import * as http from 'http'
import { Response } from 'express-serve-static-core'
import Urls from './Urls'
import TorrentInfo from './TorrentInfo'

export default class {
    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
    /**
     * cookie组成的数组
     */
    private _cookies: string[] = []
    /**
     * 获取到的cookies
     */
    private get cookie() {
        return this._cookies.join('; ')
    }

    /**
     * 用户名
     */
    private username: string
    /**
     * 密码
     */
    private password: string
    /**
     * 用户的Id
     */
    private userId: string

    /**
     * 请求信息的urls
     */
    urls: Urls
    /**
     * 获取到的种子信息
     */
    infos: {
        uploaded: TorrentInfo[]
        completed: TorrentInfo[]
    } = { 
        uploaded: [],
        completed: [],
    }

    async refreshCookie() {
        let options: http.RequestOptions = {
            method: 'post',
            headers: {
                'Host': 'www.nexushd.org',
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0',
                'Origin': 'http://www.nexushd.org',
                'Upgrade-Insecure-Requests': '1',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Referer': 'http://www.nexushd.org/login.php',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Cookie': 'c_secure_ssl=bm9wZQ%3D%3D'
            },
            path: '/takelogin.php',
            host: 'www.nexushd.org'
        }
    
        await new Promise(resolve => {
            let req = http.request(options, async (res) => {
                this._cookies = (res.headers['set-cookie'] as string[]).map(item => item.slice(0, item.indexOf(';')))
                resolve()
            })
        
            req.write(`username=${this.username}&password=${this.password}`)
        
            req.end()
        }) 
    }

    async refreshUserId() {
        let res = await fetch(`http://www.nexushd.org/users.php?search=${this.username}`, {
            headers: {
                cookie: this.cookie
            }
        })
    
        let text = await res.text()
        let id = text.match(/userdetails\.php\?id=(\d+)/)
        if(id){
            this.userId = id[1]
            this.urls = new Urls(id[1])
        } 
    }
    
    async refreshInfos() {
        let responses: Promise<string>[] = []

        for(let key in this.urls) {
            responses.push(fetch(this.urls[key], {
                headers: {
                    cookie: this.cookie
                }
            }).then(res => res.text()))
        }

        let data = await Promise.all(responses) as any
        data = data.map(item => item.split('<tr'))
        data.map(item => {
            item.shift()
            item.shift()
        })
        data[0] = data[0].map(item => item.split('<td')).map(item => {
            item.shift()
            return item
        })
        
        this.infos.uploaded = data[0].map((item: string[]) => {
            let info: TorrentInfo = {
                type: item[0].match(/title=\"([^"]+)\"/)[1],
                title: item[1].match(/title=\"([^"]+)\"/)[1],
                size: item[2].match(/>(.+)</)[1].replace('<br />', ''),
                id: Number.parseInt(item[1].match(/\?id=(\d+)/)[1]),
                seedingTime: item[6].match(/>(.+)</)[1],
            }

            return info
        }).filter((item: TorrentInfo) => item.id >= 119434)
    }
}
