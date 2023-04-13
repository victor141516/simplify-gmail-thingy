import { generateCode, parseModule } from 'magicast'

export function patch(code: string) {
  const mod = parseModule(code) as any

  mod.$ast.body.forEach((e: any) => {
    if (e?.declarations?.[0]?.init?.type !== 'ObjectExpression') return
    if (!e?.declarations?.[0]?.init?.properties) return

    e?.declarations?.[0]?.init?.properties?.some((e: any) => {
      if (e?.params?.[0]?.left?.name !== 'tries') return false
      if (e?.params?.[0]?.right?.value !== 0) return false

      return e.body.body.some((e: any) => {
        if (e.type !== 'IfStatement') return false
        if (e.consequent.type !== 'BlockStatement') return false

        const returnStatement = e?.consequent?.body.find((e: any) => e.type === 'ReturnStatement')
        if (!returnStatement) return false

        const switchStatement = returnStatement?.argument?.callee?.object?.arguments?.[0]?.body?.body?.find(
          (e: any) => e.type === 'SwitchStatement',
        )
        if (!switchStatement) return false

        const case200 = switchStatement.cases.find((e: any) => {
          return e?.test?.value === 200
        })

        const responseBodyName = case200.consequent.find((e: any) => {
          if (e?.expression?.arguments?.[0]?.type !== 'StringLiteral') return false
          if (e?.expression?.arguments?.[1]?.type !== 'Identifier') return false
          return true
        }).expression.arguments[1].name

        const returnIndex = e?.consequent?.body.findIndex((e: any) => e.type === 'ReturnStatement')
        e.consequent.body = e?.consequent?.body
          .slice(0, returnIndex)
          .concat(
            ...[
              (parseModule(`const ${responseBodyName} = ${Date.now() + 10e12};`) as any).$ast.body[0],
              case200.consequent,
            ],
          )

        return true
      })
    })
  })

  const { code: output } = generateCode(mod)
  return output
}
