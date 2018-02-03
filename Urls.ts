export default class {
    seeding: string
    uploaded: string
    completed: string
    incompleted: string
    
    constructor(userId: string) {
        //this.seeding = `http://www.nexushd.org/getusertorrentlistajax.php?userid=${userId}&type=seeding`
        this.uploaded = `http://www.nexushd.org/getusertorrentlistajax.php?userid=${userId}&type=uploaded`
        this.completed = `http://www.nexushd.org/getusertorrentlistajax.php?userid=${userId}&type=completed`
        //this.incompleted = `http://www.nexushd.org/getusertorrentlistajax.php?userid=${userId}&type=incompleted`
    }
}