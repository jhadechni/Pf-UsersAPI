const controller = {}

controller.defaultRoute = async(req,res) => {
    res.send('Alive')
}
controller.info = async(req,res) => {
    res.send('https://drive.google.com/drive/folders/1QHpzVWsThJ9kUnB9-sXN7eTvLJfL0gYl')
}


module.exports = controller