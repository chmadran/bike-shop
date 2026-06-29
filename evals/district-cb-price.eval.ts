import { defineEval } from 'eve/evals'
import { includes } from 'eve/evals/expect'
import { excludes } from '@/evals/lib/assertions'
import { assertCatalogDbInSync } from '@/evals/lib/catalog-sync'

export default defineEval({
  description: 'District CB price must come from get_catalog (£1,450), not invented amounts.',
  tags: ['prices', 'hallucination'],
  async test(t) {
    await assertCatalogDbInSync()
    await t.send('How much does the District CB cost?')
    t.completed()
    t.calledTool('get_catalog')
    t.check(t.reply, includes('1,450'))
    t.check(t.reply, excludes('£999'))
    t.check(t.reply, excludes('£1,999'))
    t.check(t.reply, excludes('£2,500'))
  },
})
