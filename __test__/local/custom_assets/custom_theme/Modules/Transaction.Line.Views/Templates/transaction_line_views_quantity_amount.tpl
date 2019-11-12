{{!--
 Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
--}}

{{#if showQuantity}}
	<p>{{translate '<span class="transaction-line-views-quantity-amount-label">Quantity: </span> <span class="transaction-line-views-quantity-amount-value">$(0)</span>' line.quantity }}</p>
{{/if}}

{{#if showAmount}}
	<p>
		<span class="transaction-line-views-quantity-amount-label">{{translate 'Total Amount:'}}</span>
		{{#if showDiscount}}
			<span class="transaction-line-views-quantity-amount-item-amount">
				{{line.total_formatted}}
			</span>
			<span class="transaction-line-views-quantity-amount-non-discounted-amount">
				{{line.amount_formatted}}
			</span>
		{{else}}
			<span class="transaction-line-views-quantity-amount-item-amount">
				{{line.amount_formatted}}
			</span>
		{{/if}}
	</p>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	line (Object)
	line.item (Object)
	line.item.internalid (Number)
	line.item.type (String)
	line.quantity (Number)
	line.internalid (String)
	line.options (Array)
	line.options.0 (Object)
	line.options.0.cartOptionId (String)
	line.options.0.itemOptionId (String)
	line.options.0.label (String)
	line.options.0.type (String)
	line.options.0.value (Object)
	line.options.0.value.internalid (String)
	line.shipaddress (undefined)
	line.shipmethod (undefined)
	line.location (String)
	line.fulfillmentChoice (String)
	lineId (String)
	showQuantity (Boolean)
	showDiscount (Boolean)
	showAmount (Boolean)

----}}
