## Installation
### Prerequisites
The following software should be installed on your system
- Node.js 10
- JRE 11

### Getting `scloud` set up in your environment
To install 3rd party dependencies run the following command and verify node_modules directory is generated:
```
npm install
```
The SuiteCloud CLI for Node.js uses a Java SDK internally which will be downloaded into the `bin` folder of this repository as part of `npm install`.

To make `scloud` command globally available on your system run:
```
npm link
```

SuiteCloud CLI commands should now be available from within any directory. You can access help by running:
```
scloud
```

### Installing SuiteCloud Node.js CLI inside the Oracle corporate network
For npm to work inside the Oracle Network, you must configure the proxy in npm by running:
```
npm config set proxy http://www-proxy-lon.uk.oracle.com --global
npm config set https-proxy http://www-proxy-lon.uk.oracle.com --global
```
Notice that the example uses the UK Oracle proxy. You may want to change the proxy configuration to a closer one to your location.

Unfortunately, for some reason npm throws an UNABLE_TO_VERIFY_LEAF_SIGNATURE error when working behind a proxy. Therefore, if you want to install a module you must run these commands first:
```
npm config set registry http://registry.npmjs.org/ --global
npm config set strict-ssl false --global
```
## Getting started with SuiteCloud Node.js CLI
Start by navigating to an SDF project folder or create your new project by running:
```
scloud createproject -i
```
Once you have a valid project, you can setup your account configuration by running:
```
scloud setupaccount
```
If you would like to use `scloud` with a Runbox/Fatbox/ScrumBox, you should setup your account configuration with:
```
scloud setupaccount --dev
```

