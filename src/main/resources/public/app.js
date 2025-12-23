const appRoot = document.getElementById("app");

let currentView = "roleSelect";
let currentRole = null;
let currentUser = null;
let cart = [];
let orders = [];
let menuItems = [];

const CREDENTIALS = {
  customer: { username: "customer", password: "customer123" },
  staff: { username: "staff", password: "staff123" },
  admin: { username: "admin", password: "admin123" },
};

const defaultConfig = {
  background_color: "#F9FAFB",
  surface_color: "#FFFFFF",
  text_color: "#111827",
  primary_color: "#2563EB",
  secondary_color: "#64748B",
  font_family: "Inter, sans-serif",
  font_size: 16,
  cafe_name: "GIKI Food Ordering System",
  tagline: "Fresh Food, Fast Service",
  welcome_message: "Welcome! Please select your role to continue",
  order_button_text: "Place Order",
};

function getConfig() {
  return defaultConfig;
}

async function initializeApp() {
  await loadMenu();
  await loadOrders();
  renderApp();
}

async function loadMenu() {
  const response = await fetch("/api/menu");
  const data = await response.json();
  menuItems = data.menu.items;
}

async function loadOrders() {
  const response = await fetch("/api/orders");
  const data = await response.json();
  orders = data.orders.map((order) => ({
    ...order,
    __backendId: order.orderId,
  }));
}

function renderApp() {
  const config = getConfig();
  if (currentView === "roleSelect") {
    appRoot.innerHTML = renderRoleSelect(config);
  } else if (currentView === "login") {
    appRoot.innerHTML = renderLogin(config);
  } else if (currentView === "customer") {
    appRoot.innerHTML = renderCustomerView(config);
  } else if (currentView === "staff") {
    appRoot.innerHTML = renderStaffView(config);
  } else if (currentView === "admin") {
    appRoot.innerHTML = renderAdminView(config);
  }
}

function renderRoleSelect(config) {
  const baseFontSize = config.font_size || defaultConfig.font_size;

  return `
    <div style="background-color: ${config.background_color}; color: ${config.text_color}; min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background-color: ${config.surface_color}; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 48px; max-width: 480px; width: 100%;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-size: ${baseFontSize * 3}px; margin-bottom: 12px;">🍽️</div>
          <h1 style="font-size: ${baseFontSize * 2}px; font-weight: 700; margin-bottom: 8px; color: ${config.text_color};">${config.cafe_name}</h1>
          <p style="font-size: ${baseFontSize * 0.95}px; color: ${config.secondary_color};">${config.tagline}</p>
        </div>

        <p style="font-size: ${baseFontSize * 1.1}px; text-align: center; margin-bottom: 32px; color: ${config.text_color};">${config.welcome_message}</p>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <button onclick="selectRole('customer')" style="background-color: ${config.primary_color}; color: white; padding: 16px 24px; border-radius: 8px; border: none; font-size: ${baseFontSize * 1.05}px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            👤 Customer Portal
          </button>
          <button onclick="selectRole('staff')" style="background-color: ${config.surface_color}; color: ${config.text_color}; padding: 16px 24px; border-radius: 8px; border: 2px solid ${config.secondary_color}; font-size: ${baseFontSize * 1.05}px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            👨‍🍳 Staff Portal
          </button>
          <button onclick="selectRole('admin')" style="background-color: ${config.surface_color}; color: ${config.text_color}; padding: 16px 24px; border-radius: 8px; border: 2px solid ${config.secondary_color}; font-size: ${baseFontSize * 1.05}px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            ⚙️ Admin Portal
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderLogin(config) {
  const baseFontSize = config.font_size || defaultConfig.font_size;
  const roleIcon = currentRole === "customer" ? "👤" : currentRole === "staff" ? "👨‍🍳" : "⚙️";
  const roleTitle = currentRole === "customer" ? "Customer" : currentRole === "staff" ? "Staff" : "Administrator";

  return `
    <div style="background-color: ${config.background_color}; color: ${config.text_color}; min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background-color: ${config.surface_color}; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 48px; max-width: 440px; width: 100%;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: ${baseFontSize * 2.5}px; margin-bottom: 12px;">${roleIcon}</div>
          <h1 style="font-size: ${baseFontSize * 1.75}px; font-weight: 700; margin-bottom: 8px; color: ${config.text_color};">${roleTitle} Login</h1>
          <p style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color};">Enter your credentials to continue</p>
        </div>

        <form onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label for="username" style="display: block; font-size: ${baseFontSize * 0.9}px; font-weight: 600; margin-bottom: 8px; color: ${config.text_color};">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              required
              style="width: 100%; padding: 12px 16px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: ${baseFontSize}px; transition: border-color 0.2s;"
              onfocus="this.style.borderColor='${config.primary_color}'"
              onblur="this.style.borderColor='#E5E7EB'"
            >
          </div>

          <div>
            <label for="password" style="display: block; font-size: ${baseFontSize * 0.9}px; font-weight: 600; margin-bottom: 8px; color: ${config.text_color};">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              required
              style="width: 100%; padding: 12px 16px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: ${baseFontSize}px; transition: border-color 0.2s;"
              onfocus="this.style.borderColor='${config.primary_color}'"
              onblur="this.style.borderColor='#E5E7EB'"
            >
          </div>

          <div id="loginError" style="display: none; padding: 12px; background-color: #FEE2E2; border-radius: 8px; color: #991B1B; font-size: ${baseFontSize * 0.9}px;"></div>

          <div style="background-color: ${config.background_color}; padding: 16px; border-radius: 8px; margin-top: 8px;">
            <p style="font-size: ${baseFontSize * 0.8}px; color: ${config.secondary_color}; margin-bottom: 8px; font-weight: 600;">Demo Credentials:</p>
            <p style="font-size: ${baseFontSize * 0.75}px; color: ${config.secondary_color}; line-height: 1.6;">
              Username: <strong>${currentRole}</strong><br>
              Password: <strong>${currentRole}123</strong>
            </p>
          </div>

          <button
            type="submit"
            id="loginButton"
            style="background-color: ${config.primary_color}; color: white; padding: 14px 24px; border-radius: 8px; border: none; font-size: ${baseFontSize * 1.05}px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            Sign In
          </button>

          <button
            type="button"
            onclick="backToRoleSelect()"
            style="background-color: ${config.surface_color}; color: ${config.secondary_color}; padding: 14px 24px; border-radius: 8px; border: 2px solid ${config.secondary_color}; font-size: ${baseFontSize * 1.05}px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            ← Back
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderCustomerView(config) {
  const baseFontSize = config.font_size || defaultConfig.font_size;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <div style="background-color: ${config.background_color}; min-height: 100%;">
      <header style="background-color: ${config.surface_color}; border-bottom: 1px solid #E5E7EB; padding: 16px 24px; position: sticky; top: 0; z-index: 50;">
        <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: ${baseFontSize * 1.5}px;">🍽️</span>
            <h1 style="font-size: ${baseFontSize * 1.25}px; font-weight: 700; color: ${config.text_color};">${config.cafe_name}</h1>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button onclick="toggleCart()" style="background-color: ${config.primary_color}; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-size: ${baseFontSize * 0.95}px; font-weight: 600; cursor: pointer; position: relative;">
              🛒 Cart ${cartCount > 0 ? `<span class="cart-badge" style="position: absolute; top: -8px; right: -8px; background-color: #DC2626; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: ${baseFontSize * 0.75}px;">${cartCount}</span>` : ""}
            </button>
            <button onclick="logout()" style="background-color: ${config.surface_color}; color: ${config.secondary_color}; padding: 10px 20px; border-radius: 8px; border: 1px solid ${config.secondary_color}; font-size: ${baseFontSize * 0.95}px; cursor: pointer;">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style="max-width: 1280px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="font-size: ${baseFontSize * 1.75}px; font-weight: 700; margin-bottom: 24px; color: ${config.text_color};">Our Menu</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
          ${menuItems.map(item => `
            <div class="menu-card" style="background-color: ${config.surface_color}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: ${baseFontSize * 3}px; text-align: center; margin-bottom: 16px;">${item.image}</div>
              <h3 style="font-size: ${baseFontSize * 1.15}px; font-weight: 600; margin-bottom: 8px; color: ${config.text_color};">${item.name}</h3>
              <p style="font-size: ${baseFontSize * 0.85}px; color: ${config.secondary_color}; margin-bottom: 8px;">${item.description}</p>
              <p style="font-size: ${baseFontSize * 0.8}px; color: ${config.secondary_color}; margin-bottom: 12px;">${item.category}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: ${baseFontSize * 1.25}px; font-weight: 700; color: ${config.primary_color};">Rs. ${item.price}</span>
                <button onclick="addToCart('${item.id}')" style="background-color: ${config.primary_color}; color: white; padding: 8px 16px; border-radius: 6px; border: none; font-size: ${baseFontSize * 0.9}px; font-weight: 600; cursor: pointer;">
                  Add to Cart
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </main>

      <div id="cartModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center; padding: 20px;">
        <div style="background-color: ${config.surface_color}; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90%; overflow-y: auto; padding: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="font-size: ${baseFontSize * 1.5}px; font-weight: 700; color: ${config.text_color};">Your Cart</h2>
            <button onclick="toggleCart()" style="background: none; border: none; font-size: ${baseFontSize * 1.5}px; cursor: pointer; color: ${config.secondary_color};">×</button>
          </div>

          <div id="cartItems">
            ${cart.length === 0 ? `
              <p style="text-align: center; color: ${config.secondary_color}; padding: 40px 0; font-size: ${baseFontSize}px;">Your cart is empty</p>
            ` : `
              ${cart.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #E5E7EB;">
                  <div style="flex: 1;">
                    <h3 style="font-size: ${baseFontSize * 1.05}px; font-weight: 600; margin-bottom: 4px; color: ${config.text_color};">${item.name}</h3>
                    <p style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color};">Rs. ${item.price} each</p>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" style="background-color: ${config.surface_color}; border: 1px solid ${config.secondary_color}; color: ${config.text_color}; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; font-size: ${baseFontSize * 1.1}px;">-</button>
                    <span style="font-size: ${baseFontSize}px; font-weight: 600; min-width: 32px; text-align: center; color: ${config.text_color};">${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" style="background-color: ${config.surface_color}; border: 1px solid ${config.secondary_color}; color: ${config.text_color}; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; font-size: ${baseFontSize * 1.1}px;">+</button>
                    <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #DC2626; cursor: pointer; font-size: ${baseFontSize * 1.2}px; padding: 4px;">🗑️</button>
                  </div>
                </div>
              `).join("")}

              <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #E5E7EB;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                  <span style="font-size: ${baseFontSize * 1.25}px; font-weight: 700; color: ${config.text_color};">Total:</span>
                  <span style="font-size: ${baseFontSize * 1.5}px; font-weight: 700; color: ${config.primary_color};">Rs. ${cartTotal}</span>
                </div>

                <div style="margin-bottom: 16px;">
                  <label style="display: block; font-size: ${baseFontSize * 0.9}px; font-weight: 600; margin-bottom: 8px; color: ${config.text_color};">Your Name</label>
                  <input type="text" id="customerName" placeholder="Enter your name" style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: ${baseFontSize}px;">
                </div>

                <div style="margin-bottom: 16px;">
                  <label style="display: block; font-size: ${baseFontSize * 0.9}px; font-weight: 600; margin-bottom: 8px; color: ${config.text_color};">Email</label>
                  <input type="email" id="customerEmail" placeholder="Enter your email" style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: ${baseFontSize}px;">
                </div>

                <div style="margin-bottom: 24px;">
                  <label style="display: block; font-size: ${baseFontSize * 0.9}px; font-weight: 600; margin-bottom: 8px; color: ${config.text_color};">Special Instructions (Optional)</label>
                  <textarea id="orderNotes" placeholder="Any special requests?" rows="3" style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: ${baseFontSize}px; resize: vertical;"></textarea>
                </div>

                <button id="placeOrderBtn" onclick="placeOrder()" style="width: 100%; background-color: ${config.primary_color}; color: white; padding: 16px; border-radius: 8px; border: none; font-size: ${baseFontSize * 1.05}px; font-weight: 600; cursor: pointer;">
                  ${config.order_button_text}
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStaffView(config) {
  const baseFontSize = config.font_size || defaultConfig.font_size;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "preparing");

  return `
    <div style="background-color: ${config.background_color}; min-height: 100%;">
      <header style="background-color: ${config.surface_color}; border-bottom: 1px solid #E5E7EB; padding: 16px 24px;">
        <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: ${baseFontSize * 1.5}px; font-weight: 700; color: ${config.text_color};">👨‍🍳 Staff Portal</h1>
            <p style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color};">Manage incoming orders</p>
          </div>
          <button onclick="logout()" style="background-color: ${config.surface_color}; color: ${config.secondary_color}; padding: 10px 20px; border-radius: 8px; border: 1px solid ${config.secondary_color}; font-size: ${baseFontSize * 0.95}px; cursor: pointer;">
            Logout
          </button>
        </div>
      </header>

      <main style="max-width: 1280px; margin: 0 auto; padding: 32px 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: ${baseFontSize * 1.5}px; font-weight: 700; color: ${config.text_color};">Active Orders (${pendingOrders.length})</h2>
        </div>

        ${pendingOrders.length === 0 ? `
          <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 48px; text-align: center;">
            <div style="font-size: ${baseFontSize * 4}px; margin-bottom: 16px;">✨</div>
            <p style="font-size: ${baseFontSize * 1.15}px; color: ${config.secondary_color};">No active orders at the moment</p>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
            ${pendingOrders.map(order => `
              <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                  <div>
                    <h3 style="font-size: ${baseFontSize * 1.15}px; font-weight: 700; margin-bottom: 4px; color: ${config.text_color};">${order.customerName}</h3>
                    <p style="font-size: ${baseFontSize * 0.85}px; color: ${config.secondary_color};">${order.customerEmail || "-"}</p>
                  </div>
                  <span class="order-status-${order.status}" style="padding: 6px 12px; border-radius: 6px; font-size: ${baseFontSize * 0.8}px; font-weight: 600; text-transform: uppercase;">
                    ${order.status}
                  </span>
                </div>

                <div style="margin-bottom: 16px; padding: 16px; background-color: ${config.background_color}; border-radius: 8px;">
                  ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-size: ${baseFontSize * 0.95}px; color: ${config.text_color};">${item.quantity}x ${item.name}</span>
                      <span style="font-size: ${baseFontSize * 0.95}px; font-weight: 600; color: ${config.text_color};">Rs. ${(item.price * item.quantity)}</span>
                    </div>
                  `).join("")}
                  <div style="border-top: 2px solid #E5E7EB; margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between;">
                    <span style="font-size: ${baseFontSize * 1.05}px; font-weight: 700; color: ${config.text_color};">Total:</span>
                    <span style="font-size: ${baseFontSize * 1.05}px; font-weight: 700; color: ${config.primary_color};">Rs. ${order.total}</span>
                  </div>
                </div>

                ${order.notes ? `
                  <div style="margin-bottom: 16px; padding: 12px; background-color: #FEF3C7; border-radius: 6px;">
                    <p style="font-size: ${baseFontSize * 0.85}px; color: #92400E;"><strong>Note:</strong> ${order.notes}</p>
                  </div>
                ` : ""}

                <div style="font-size: ${baseFontSize * 0.8}px; color: ${config.secondary_color}; margin-bottom: 16px;">
                  Ordered: ${new Date(order.orderDate).toLocaleString()}
                </div>

                <div style="display: flex; gap: 8px;">
                  ${order.status === "pending" ? `
                    <button onclick="updateOrderStatus('${order.__backendId}', 'preparing')" style="flex: 1; background-color: ${config.primary_color}; color: white; padding: 12px; border-radius: 6px; border: none; font-size: ${baseFontSize * 0.9}px; font-weight: 600; cursor: pointer;">
                      Start Preparing
                    </button>
                  ` : ""}
                  ${order.status === "preparing" ? `
                    <button onclick="updateOrderStatus('${order.__backendId}', 'ready')" style="flex: 1; background-color: #10B981; color: white; padding: 12px; border-radius: 6px; border: none; font-size: ${baseFontSize * 0.9}px; font-weight: 600; cursor: pointer;">
                      Mark Ready
                    </button>
                  ` : ""}
                  ${order.status === "ready" ? `
                    <button onclick="updateOrderStatus('${order.__backendId}', 'completed')" style="flex: 1; background-color: #22C55E; color: white; padding: 12px; border-radius: 6px; border: none; font-size: ${baseFontSize * 0.9}px; font-weight: 600; cursor: pointer;">
                      Mark Completed
                    </button>
                  ` : ""}
                  <button onclick="updateOrderStatus('${order.__backendId}', 'cancelled')" style="background-color: #EF4444; color: white; padding: 12px 16px; border-radius: 6px; border: none; font-size: ${baseFontSize * 0.9}px; font-weight: 600; cursor: pointer;">
                    Cancel
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </main>
    </div>
  `;
}

function renderAdminView(config) {
  const baseFontSize = config.font_size || defaultConfig.font_size;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const completedCount = orders.filter(o => o.status === "completed").length;

  return `
    <div style="background-color: ${config.background_color}; min-height: 100%;">
      <header style="background-color: ${config.surface_color}; border-bottom: 1px solid #E5E7EB; padding: 16px 24px;">
        <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: ${baseFontSize * 1.5}px; font-weight: 700; color: ${config.text_color};">⚙️ Admin Portal</h1>
            <p style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color};">System overview and management</p>
          </div>
          <button onclick="logout()" style="background-color: ${config.surface_color}; color: ${config.secondary_color}; padding: 10px 20px; border-radius: 8px; border: 1px solid ${config.secondary_color}; font-size: ${baseFontSize * 0.95}px; cursor: pointer;">
            Logout
          </button>
        </div>
      </header>

      <main style="max-width: 1280px; margin: 0 auto; padding: 32px 24px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px;">
          <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: ${baseFontSize * 2}px; margin-bottom: 8px;">📊</div>
            <h3 style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color}; margin-bottom: 8px;">Total Orders</h3>
            <p style="font-size: ${baseFontSize * 2}px; font-weight: 700; color: ${config.text_color};">${totalOrders}</p>
          </div>

          <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: ${baseFontSize * 2}px; margin-bottom: 8px;">💰</div>
            <h3 style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color}; margin-bottom: 8px;">Total Revenue</h3>
            <p style="font-size: ${baseFontSize * 2}px; font-weight: 700; color: ${config.primary_color};">Rs. ${totalRevenue}</p>
          </div>

          <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: ${baseFontSize * 2}px; margin-bottom: 8px;">⏳</div>
            <h3 style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color}; margin-bottom: 8px;">Pending Orders</h3>
            <p style="font-size: ${baseFontSize * 2}px; font-weight: 700; color: ${config.text_color};">${pendingCount}</p>
          </div>

          <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: ${baseFontSize * 2}px; margin-bottom: 8px;">✅</div>
            <h3 style="font-size: ${baseFontSize * 0.9}px; color: ${config.secondary_color}; margin-bottom: 8px;">Completed</h3>
            <p style="font-size: ${baseFontSize * 2}px; font-weight: 700; color: ${config.text_color};">${completedCount}</p>
          </div>
        </div>

        <h2 style="font-size: ${baseFontSize * 1.5}px; font-weight: 700; margin-bottom: 24px; color: ${config.text_color};">All Orders</h2>

        ${orders.length === 0 ? `
          <div style="background-color: ${config.surface_color}; border-radius: 12px; padding: 48px; text-align: center;">
            <div style="font-size: ${baseFontSize * 4}px; margin-bottom: 16px;">📋</div>
            <p style="font-size: ${baseFontSize * 1.15}px; color: ${config.secondary_color};">No orders yet</p>
          </div>
        ` : `
          <div style="background-color: ${config.surface_color}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background-color: ${config.background_color};">
                <tr>
                  <th style="text-align: left; padding: 16px; font-size: ${baseFontSize * 0.9}px; font-weight: 600; color: ${config.text_color};">Customer</th>
                  <th style="text-align: left; padding: 16px; font-size: ${baseFontSize * 0.9}px; font-weight: 600; color: ${config.text_color};">Items</th>
                  <th style="text-align: left; padding: 16px; font-size: ${baseFontSize * 0.9}px; font-weight: 600; color: ${config.text_color};">Total</th>
                  <th style="text-align: left; padding: 16px; font-size: ${baseFontSize * 0.9}px; font-weight: 600; color: ${config.text_color};">Status</th>
                  <th style="text-align: left; padding: 16px; font-size: ${baseFontSize * 0.9}px; font-weight: 600; color: ${config.text_color};">Date</th>
                  <th style="text-align: left; padding: 16px; font-size: ${baseFontSize * 0.9}px; font-weight: 600; color: ${config.text_color};">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(order => `
                  <tr style="border-top: 1px solid #E5E7EB;">
                    <td style="padding: 16px;">
                      <div style="font-size: ${baseFontSize * 0.95}px; font-weight: 600; margin-bottom: 4px; color: ${config.text_color};">${order.customerName}</div>
                      <div style="font-size: ${baseFontSize * 0.8}px; color: ${config.secondary_color};">${order.customerEmail || "-"}</div>
                    </td>
                    <td style="padding: 16px; font-size: ${baseFontSize * 0.9}px; color: ${config.text_color};">
                      ${order.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}
                    </td>
                    <td style="padding: 16px; font-size: ${baseFontSize * 0.95}px; font-weight: 600; color: ${config.primary_color};">Rs. ${order.total}</td>
                    <td style="padding: 16px;">
                      <span class="order-status-${order.status}" style="padding: 6px 12px; border-radius: 6px; font-size: ${baseFontSize * 0.75}px; font-weight: 600; text-transform: uppercase; white-space: nowrap;">
                        ${order.status}
                      </span>
                    </td>
                    <td style="padding: 16px; font-size: ${baseFontSize * 0.85}px; color: ${config.secondary_color};">
                      ${new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td style="padding: 16px;">
                      <button onclick="deleteOrder('${order.__backendId}')" style="background-color: #EF4444; color: white; padding: 8px 12px; border-radius: 6px; border: none; font-size: ${baseFontSize * 0.85}px; cursor: pointer;">
                        Delete
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}
      </main>
    </div>
  `;
}

function selectRole(role) {
  currentRole = role;
  currentView = "login";
  renderApp();
}

function backToRoleSelect() {
  currentRole = null;
  currentView = "roleSelect";
  renderApp();
}

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");

  const credentials = CREDENTIALS[currentRole];
  if (username === credentials.username && password === credentials.password) {
    currentUser = username;
    currentView = currentRole;
    renderApp();
  } else {
    errorDiv.textContent = "❌ Invalid username or password. Please try again.";
    errorDiv.style.display = "block";
    errorDiv.style.animation = "shake 0.4s";
    setTimeout(() => {
      errorDiv.style.animation = "";
    }, 400);
  }
}

function logout() {
  currentRole = null;
  currentUser = null;
  currentView = "roleSelect";
  cart = [];
  renderApp();
}

function addToCart(itemId) {
  const menuItem = menuItems.find((item) => item.id === itemId);
  if (!menuItem) return;

  const existingItem = cart.find((item) => item.id === itemId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...menuItem, quantity: 1 });
  }

  renderApp();
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  renderApp();
}

function updateCartQuantity(itemId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(itemId);
    return;
  }

  const item = cart.find((entry) => entry.id === itemId);
  if (item) {
    item.quantity = newQuantity;
    renderApp();
  }
}

function toggleCart() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    modal.style.display = modal.style.display === "none" ? "flex" : "none";
  }
}

async function placeOrder() {
  if (orders.length >= 999) {
    showToast("Maximum limit of 999 orders reached. Please contact administrator.", "error");
    return;
  }

  const customerName = document.getElementById("customerName")?.value.trim();
  const customerEmail = document.getElementById("customerEmail")?.value.trim();
  const orderNotes = document.getElementById("orderNotes")?.value.trim();

  if (!customerName || !customerEmail) {
    showToast("Please enter your name and email", "error");
    return;
  }

  if (cart.length === 0) {
    showToast("Your cart is empty", "error");
    return;
  }

  const button = document.getElementById("placeOrderBtn");
  if (button) {
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner" style="margin: 0 auto;"></div>';
  }

  const orderData = {
    customerName,
    customerEmail,
    notes: orderNotes || "",
    items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
  };

  const response = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (response.ok) {
    cart = [];
    await loadOrders();
    toggleCart();
    showToast("Order placed successfully! 🎉", "success");
    renderApp();
  } else {
    showToast("Failed to place order. Please try again.", "error");
    if (button) {
      button.disabled = false;
      button.innerHTML = getConfig().order_button_text || defaultConfig.order_button_text;
    }
  }
}

async function updateOrderStatus(orderId, newStatus) {
  const response = await fetch("/api/orders/status", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `orderId=${encodeURIComponent(orderId)}&status=${encodeURIComponent(newStatus)}`,
  });

  if (response.ok) {
    await loadOrders();
    showToast(`Order status updated to ${newStatus}`, "success");
    renderApp();
  } else {
    showToast("Failed to update order status", "error");
  }
}

async function deleteOrder(orderId) {
  const confirmed = confirm("Are you sure you want to delete this order? This action cannot be undone.");
  if (!confirmed) return;

  const response = await fetch("/api/orders/delete", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `orderId=${encodeURIComponent(orderId)}`,
  });

  if (response.ok) {
    await loadOrders();
    showToast("Order deleted successfully", "success");
    renderApp();
  } else {
    showToast("Failed to delete order", "error");
  }
}

function showToast(message, type = "info") {
  const config = getConfig();
  const baseFontSize = config.font_size || defaultConfig.font_size;
  const bgColor = type === "error" ? "#EF4444" : type === "success" ? "#10B981" : config.primary_color;

  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background-color: ${bgColor};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    font-size: ${baseFontSize * 0.95}px;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", initializeApp);
