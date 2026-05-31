/** Mobile account menu (profile, theme, sign out) opened from bottom nav. */
class AppMobileMenuStore {
	open = $state(false);

	openMenu() {
		this.open = true;
	}

	closeMenu() {
		this.open = false;
	}

	toggleMenu() {
		this.open = !this.open;
	}
}

export const appMobileMenu = new AppMobileMenuStore();
