import * as express from 'express'
import * as bodyParser from 'body-parser'
import Info from './Info'
import fetch from 'node-fetch';

const app = express()

app.use(bodyParser.json())
app.use(express.static('static'))

app.post('/info', async (req, res) => {
    let info = new Info(req.body.username, req.body.password)
    await info.refreshCookie()
    await info.refreshUserId()
    await info.refreshInfos()

    res.send(JSON.stringify(info.infos))
})

app.listen(80)
