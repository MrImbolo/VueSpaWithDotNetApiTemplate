# VueSpaWithDotNetApiTemplate

Powerful template application using dotnet 6 WebAPI as a backend 
and VueJS 3 as an client SPA. 

## Backend

Backend app is a default dotnet 6 WebAPI with JWT-based 
authentications and authorization. 

EF Core is used as ORM and default db is LocalDB. 

Request are served via Minimal API because of it's modernity, simplicity and 
versatility

## Client

Client app is SPA on VueJS 3 with router and VueX store. 

Router is set up to permit non-guarded routes or ones, matching user claims, 
otherwise user is redirected to page with name Login.

Store can be used with root fields, but using modules is recommended. 


