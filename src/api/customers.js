import http from './http'

export function searchCustomerByDocument(document) {
  return http.get('/customers/search', { params: { document } })
}
