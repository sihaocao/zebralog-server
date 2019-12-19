const ZebralogsService = {
    getAllZebralogs(knex) {
      return knex.select('*').from('zebralogs').orderBy('id', 'desc')
    },
    getZebralogById(knex, id) {
      return knex.from('zebralogs').select('*').where('id', id).first()
    },
    insertZebralog(knex, newZebralog) {
      return knex
        .insert(newZebralog)
        .into('zebralogs')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteZebralog(knex, id) {
      return knex('zebralogs')
        .where({ id })
        .delete()
    },
    updateZebralog(knex, id, newZebralogFields) {
      return knex('zebralogs')
        .where({ id })
        .update(newZebralogFields)
    },
}
  
module.exports = ZebralogsService