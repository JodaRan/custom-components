import { defineRule, configure } from 'vee-validate'
import {
  required,
  email,
  min,
  numeric,
  between,
  max,
  min_value,
  max_value,
  confirmed,
  is_not
} from '@vee-validate/rules'

const message =
  (func: (...args: any[]) => string | boolean | Promise<string | boolean>, errorMessage: string) =>
  (...args: any[]) => {
    if (!args[1] || !Array.isArray(args[1])) return func(...args) !== true ? errorMessage : true
    const _errorMessage: string = errorMessage
    const errors = args[1].reduce((acc, arg, id) => acc.replace(`$${id + 1}`, arg), _errorMessage)
    return func(...args) !== true ? errors : true
  }
export default function initializeRules() {
  // Message d'erreur par défaut
  configure({
    generateMessage: (context) => {
      return `Le champ ${context.field} est invalide`
    }
  })

  // Règles laravel
  defineRule('required', message(required, 'Champ requis'))
  defineRule('email', message(email, 'Email non valide'))
  defineRule('min', message(min, 'Doit avoir $1 de longueur au minimum'))
  defineRule('max', message(max, 'Doit avoir $1 de longueur au maximum'))
  defineRule('min_value', message(min_value, 'Doit supérieur à $1'))
  defineRule('max_value', message(max_value, 'Doit inférieur à $1'))
  defineRule('numeric', message(numeric, 'Doit être un nombre'))
  defineRule('between', message(between, 'Doit être entre $1 et $2'))
  defineRule('confirmed', message(confirmed, 'Doit être comme $2'))
  defineRule('is_not', message(is_not, 'Ne doit pas être $1'))

  // Règles personnalisé
  defineRule('not_empty_array', (value: unknown) => {
    if (!Array.isArray(value)) return 'Champs invalide'
    if (value.length <= 0) return 'Choix requis'
    return true
  })

  defineRule('strict_min_value', (value: string | number, [min]: number[]) => {
    if (isNaN(+value)) return 'Nombre invalide'
    if (isNaN(+min)) return 'Validateur invalide'
    if (+value <= +min) return `Doit être strictement supérieur à ${min}`
    return true
  })
  defineRule('strict_max_value', (value: string | number, [max]: number[]) => {
    if (isNaN(+value)) return 'Nombre invalide'
    if (isNaN(+max)) return 'Validateur invalide'
    if (+value >= +max) return `Doit être strictement inférieur à ${max}`
    return true
  })

  defineRule('starts_with', (value: string, [...startings]: string[]) => {
    if (!value) return true
    const _startings = startings.join(' ou ')
    if (!startings.some((starting) => value.startsWith(starting)))
      return `Doit commencer par ${_startings}`
    return true
  })

  defineRule('ends_with', (value: string, [...startings]: string[]) => {
    if (!value) return true
    const _startings = startings.join(' ou ')
    if (!startings.some((starting) => value.endsWith(starting)))
      return `Doit commencer par ${_startings}`
    return true
  })
}
