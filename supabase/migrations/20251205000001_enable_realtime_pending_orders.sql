-- Enable realtime on pending_orders table for live updates in admin panel
-- This allows the Quiz Analytics page to automatically update when order status changes

-- Add pending_orders to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE pending_orders;
