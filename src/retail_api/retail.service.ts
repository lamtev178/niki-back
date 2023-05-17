import { Injectable } from '@nestjs/common'
import { CrmType, Order, OrdersFilter, RetailPagination } from './types'
import axios, { AxiosInstance } from 'axios'
import { ConcurrencyManager } from 'axios-concurrency'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance
  private readonly ordersList: Order[]

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: { 
        "X-API-KEY": process.env.RETAIL_KEY
      },
    })
  }

  async orders(filter?: OrdersFilter): Promise<{orders: Order[], pagination: RetailPagination}> {
    const params = serialize(filter, '')
    const resp = await this.axios.get('/orders?' + params)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.orders as Array<any>)
    const pagination: RetailPagination = resp.data.pagination

    return {orders, pagination}
  }

  async findOrder(id: string): Promise<Order | null> {
    const resp = await this.axios.get('/orders/'+id+'?site=demo-magazin')

    if (!resp.data) throw new Error('RETAIL CRM ERROR')
    const order = plainToClass(Order, resp.data.order)

    return order
  }

  async orderStatuses(): Promise<CrmType[]> {
    const resp = await this.axios.get('/reference/statuses?site=demo-magazin')

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const res = Object.values(resp.data.statuses).map((el:any) => ({code: el.code, name: el.name}))

    return res
  }

  async productStatuses(): Promise<CrmType[]> {
    const resp = await this.axios.get('/reference/product-statuses?site=demo-magazin')

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const res = Object.values(resp.data.productStatuses).map((el:any) => ({code: el.code, name: el.name}))

    return res
  }

  async deliveryTypes(): Promise<CrmType[]> {
    const resp = await this.axios.get('/reference/delivery-types?site=demo-magazin')

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const res = Object.values(resp.data.deliveryTypes).map((el:any) => ({code: el.code, name: el.name}))

    return res
    
  }
}
