/**
 * Shopify Admin API utilities for managing discount codes
 *
 * Prerequisites:
 * 1. Create a custom app in Shopify Admin: https://shop.testograph.eu/admin/settings/apps/development
 * 2. Grant permissions: write_discounts, read_discounts
 * 3. Get Admin API access token and add to .env.local as SHOPIFY_ADMIN_ACCESS_TOKEN
 */

interface ShopifyDiscountCodeCreateResponse {
  success: boolean;
  discountCode?: {
    id: string;
    code: string;
    discountId: string;
  };
  error?: string;
  details?: any;
}

interface CreateDiscountCodeParams {
  code: string;
  discountPercentage: number;
  title?: string;
  startsAt?: string;
  endsAt?: string | null;
  combinesWith?: {
    orderDiscounts: boolean;
    productDiscounts: boolean;
    shippingDiscounts: boolean;
  };
}

/**
 * Creates a discount code in Shopify that cannot be combined with other discounts
 *
 * @param params - Discount code parameters
 * @returns Response with discount code details or error
 */
export async function createShopifyDiscountCode(
  params: CreateDiscountCodeParams
): Promise<ShopifyDiscountCodeCreateResponse> {
  const {
    code,
    discountPercentage,
    title = `Affiliate ${code}`,
    startsAt = new Date().toISOString(),
    endsAt = null,
    combinesWith = {
      orderDiscounts: false,
      productDiscounts: false,
      shippingDiscounts: false,
    },
  } = params;

  // Check for required environment variables
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!shopDomain) {
    console.error('❌ SHOPIFY_STORE_DOMAIN not configured in .env.local');
    return {
      success: false,
      error: 'Shopify store domain not configured',
    };
  }

  if (!accessToken) {
    console.error('❌ SHOPIFY_ADMIN_ACCESS_TOKEN not configured in .env.local');
    console.log('📝 To set up:');
    console.log('   1. Go to: https://shop.testograph.eu/admin/settings/apps/development');
    console.log('   2. Create a custom app with write_discounts permission');
    console.log('   3. Copy the Admin API access token');
    console.log('   4. Add SHOPIFY_ADMIN_ACCESS_TOKEN to .env.local');

    return {
      success: false,
      error: 'Shopify Admin API access token not configured',
    };
  }

  const shopifyApiUrl = `https://${shopDomain}/admin/api/2025-01/graphql.json`;

  // GraphQL mutation to create a percentage-based discount code
  const mutation = `
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 1) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
  `;

  const variables = {
    basicCodeDiscount: {
      title,
      code,
      startsAt,
      endsAt,
      customerSelection: {
        all: true,
      },
      customerGets: {
        value: {
          percentage: discountPercentage / 100, // Convert 10 to 0.1
        },
        items: {
          all: true,
        },
      },
      combinesWith,
    },
  };

  try {
    console.log(`🛍️ Creating Shopify discount code: ${code} (${discountPercentage}%)`);

    const response = await fetch(shopifyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API error:', response.status, errorText);
      return {
        success: false,
        error: `Shopify API returned ${response.status}`,
        details: errorText,
      };
    }

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return {
        success: false,
        error: 'GraphQL errors',
        details: result.errors,
      };
    }

    // Check for user errors
    const userErrors = result.data?.discountCodeBasicCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error('❌ Discount creation errors:', userErrors);
      return {
        success: false,
        error: userErrors.map((e: any) => e.message).join(', '),
        details: userErrors,
      };
    }

    // Success
    const codeDiscountNode = result.data?.discountCodeBasicCreate?.codeDiscountNode;
    const createdCode = codeDiscountNode?.codeDiscount?.codes?.nodes?.[0]?.code;

    if (!createdCode) {
      console.error('❌ Discount created but code not found in response:', result);
      return {
        success: false,
        error: 'Discount created but code not returned',
        details: result,
      };
    }

    console.log(`✅ Shopify discount code created successfully: ${createdCode}`);

    return {
      success: true,
      discountCode: {
        id: codeDiscountNode.id,
        code: createdCode,
        discountId: codeDiscountNode.codeDiscount?.id || codeDiscountNode.id,
      },
    };

  } catch (error: any) {
    console.error('❌ Error creating Shopify discount code:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      details: error,
    };
  }
}

/**
 * Validates that Shopify credentials are configured
 */
export function isShopifyConfigured(): boolean {
  return !!(
    process.env.SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  );
}
