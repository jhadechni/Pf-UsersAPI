const controller = {}


controller.infoTransactionQuery = (valor,tipo) => [
    {
        $match: {
            cedula: valor
        }
    },
    {
        $match: {
            type: tipo
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

controller.infoTransactionQuerybyEnrollment = (valor,tipo) => [
    {
        $match: {
            enrollmentNumber: valor
        }
    },
    {
        $match: {
            type: tipo
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