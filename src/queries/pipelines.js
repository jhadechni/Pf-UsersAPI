const controller = {}


controller.infoTransactionQuery = [
    {
        $group: {
            _id: '$enrollmentNumber',
            count: {
                $sum: 1,
            },
            items: {
                $push: '$$ROOT'
            }
        }
    },
    {
        $unwind: {
            path: '$items'

        }
    },
    {
        $sort: {
            'times.timestamp': -1
        }
    },
    {
        $group: {
            _id: '$_id',
            item: {
                $first: '$items'
            }

        }
    },
    {
        $replaceRoot : {
            newRoot: '$item'
          }
    }
]




module.exports = controller