export const PINA_ALERT_TYPES = {
  'SUCCESS': 'success',
  'ERROR': 'error'
};

export function PinaAlertTypesAware(constructor: Function) {
  constructor.prototype.PINA_ALERT_TYPES = PINA_ALERT_TYPES;
}
