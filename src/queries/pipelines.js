const controller = {}


controller.infoTransactionQuery = (valor) => [
    {
        $match: {
            cedula: valor
        }
    },
    {
        $sort: {
            timeStamp: -1
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