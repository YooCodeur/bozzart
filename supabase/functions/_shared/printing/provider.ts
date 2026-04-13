// Abstract print provider interface — allows swapping Printful / Gelato / etc.

export interface PrintOrderInput {
  external_reference: string; // our print_orders.id
  artwork_image_url: string;
  format: string;
  quantity: number;
  shipping: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
    state?: string;
  };
}

export interface PrintOrderResult {
  external_order_id: string;
  status: string;
}

export interface PrintTrackingInfo {
  tracking_number: string | null;
  carrier: string | null;
  status: string;
}

export interface PrintProvider {
  createOrder(input: PrintOrderInput): Promise<PrintOrderResult>;
  getTracking(externalOrderId: string): Promise<PrintTrackingInfo>;
}

// Stub Printful provider — TODO: implement with real API calls.
export class PrintfulProvider implements PrintProvider {
  // deno-lint-ignore no-unused-vars
  async createOrder(_input: PrintOrderInput): Promise<PrintOrderResult> {
    throw new Error("TODO: implement PrintfulProvider.createOrder");
  }

  // deno-lint-ignore no-unused-vars
  async getTracking(_externalOrderId: string): Promise<PrintTrackingInfo> {
    throw new Error("TODO: implement PrintfulProvider.getTracking");
  }
}

export function getPrintProvider(): PrintProvider {
  // Future: switch on env var PRINT_PROVIDER
  return new PrintfulProvider();
}
