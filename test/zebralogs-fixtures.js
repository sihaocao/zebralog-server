function makeZebralogsArray() {
    return [
        {
            id: 1,
            game_date: '2019-02-01',
            site: 'Boston High School',
            distance: '25',
            paid: 'Yes',
            type: 'Varsity',
            amount: '85',
            notes: 'None',
        },
        {
            id: 2,
            game_date: '2019-03-01',
            site: 'Worcester High School',
            distance: '35',
            paid: 'Yes',
            type: 'Subvarsity',
            amount: '64',
            notes: 'None',
        },
        {
            id: 3,
            game_date: '2019-04-01',
            site: 'Springfield High School',
            distance: '45',
            paid: 'Yes',
            type: 'Tournament',
            amount: '45',
            notes: 'None',
        },
    ]
}

module.exports = {makeZebralogsArray}