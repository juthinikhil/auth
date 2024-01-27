{
    let auth0Client = null;
    {
    const fetchAuthConfig = () => fetch("/auth_config.json");
    {

        const configureClient = async () => {
            const response = await fetchAuthConfig();
            const config = await response.json();

            auth0Client = await auth0.createAuth0Client({
                domain: config.domain,
                clientId: config.clientId
            });
        };}
        window.onload = async () => {
            await configureClient();
        }
        {
            window.onload = async () => {
                await configureClient();

                // NEW - update the UI state
                updateUI();
            };

            const updateUI = async () => {
                const isAuthenticated = await auth0Client.isAuthenticated();

                document.getElementById("btn-logout").disabled = !isAuthenticated;
                document.getElementById("btn-login").disabled = isAuthenticated;
                document.getElementById("btn-call-api").disabled = !isAuthenticated;
                // NEW - add logic to show/hide gated content after authentication
                if (isAuthenticated) {
                    document.getElementById("gated-content").classList.remove("hidden");

                    document.getElementById(
                        "ipt-access-token"
                    ).innerHTML = await auth0Client.getTokenSilently();

                    document.getElementById("ipt-user-profile").textContent = JSON.stringify(
                        await auth0Client.getUser()
                    );

                } else {
                    document.getElementById("gated-content").classList.add("hidden");
                }
            };}
        {
            const login = async () => {
                await auth0Client.loginWithRedirect({
                    authorizationParams: {
                        redirect_uri: window.location.origin
                    }
                });
            };}
        {// ..

            window.onload = async () => {

                // .. code ommited for brevity

                updateUI();

                const isAuthenticated = await auth0Client.isAuthenticated();

                if (isAuthenticated) {
                    // show the gated content
                    return;
                }

                // NEW - check for the code and state parameters
                const query = window.location.search;
                if (query.includes("code=") && query.includes("state=")) {

                    // Process the login state
                    await auth0Client.handleRedirectCallback();

                    updateUI();

                    // Use replaceState to redirect the user away and remove the querystring parameters
                    window.history.replaceState({}, document.title, "/");
                }
            };
        }
        {// public/js/app.js

            const logout = () => {
                auth0Client.logout({
                    logoutParams: {
                        returnTo: window.location.origin
                    }
                });
            };}
}
    const configureClient = async () => {
        const response = await fetchAuthConfig();
        const config = await response.json();

        auth0 = await auth0Client.createAuth0Client({
            domain: config.domain,
            clientId: config.clientId,
            authorizationParams: {
                audience: config.audience   // NEW - add the audience value
            }
        });
    };

    const callApi = async () => {
        try {

            // Get the access token from the Auth0 client
            const token = await auth0Client.getTokenSilently();

            // Make the call to the API, setting the token
            // in the Authorization header
            const response = await fetch("/api/external", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Fetch the JSON result
            const responseData = await response.json();

            // Display the result in the output element
            const responseElement = document.getElementById("api-call-result");

            responseElement.innerText = JSON.stringify(responseData, {}, 2);

        } catch (e) {
            // Display errors in the console
            console.error(e);
        }
    };

    // public/js/app.js

    const updateUI = async () => {
        const isAuthenticated = await auth0Client.isAuthenticated();

        document.getElementById("btn-logout").disabled = !isAuthenticated;
        document.getElementById("btn-login").disabled = isAuthenticated;

        // NEW - enable the button to call the API
        document.getElementById("btn-call-api").disabled = !isAuthenticated;

        // .. other code omitted for brevity ..
    };
}