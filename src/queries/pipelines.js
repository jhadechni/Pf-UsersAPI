const controller = {}


controller.infoTransactionQuery = [
    {
        $sort: {
            timeStamp : -1
        }
    },
    {
        $group: {
            _id: '$enrollmentNumber',
            items: {
                $push: '$$ROOT'
            }
        }
    },
    {
        $replaceRoot: {
            newRoot: {
                $first: '$items'
            }
        }
    }
]




module.exports = controller