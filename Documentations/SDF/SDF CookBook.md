# SuiteCloud Development Framework (SDF)

SDF is Oracle's tooling for managing NetSuite customizations as source-controlled files instead of clicking through the UI. Paired with the SuiteCloud Extension for VS Code, it gives you git-based version control and a much faster upload/download/deploy loop than the traditional "copy-paste into the script editor every time" workflow.

---

# How to deploy

1. Make sure you have the **Oracle NetSuite SuiteCloud Extension** installed in VS Code.

2. Press `Ctrl+Shift+P`, then choose **SuiteCloud: Create Project**.

3. Choose the directory for the project.

## Make sure the SuiteCloud CLI is installed

```
npm install -g @oracle/suitecloud-cli
```

4. Run `suitecloud account:setup` to authenticate against your NetSuite account (the VS Code UI shortcut for this is usually more reliable than the raw CLI command).

## To download a script

Example:

```
suitecloud file:import --paths "/SuiteScripts/my_restlet.js"
```

## To upload an updated script

Press `Ctrl+Shift+P`, then choose **Upload File**.

## To create a script and upload it

1. Press `Ctrl+Shift+P`.
2. Choose **Create SuiteScript File**.
3. Choose the SuiteScript type.
4. (Optional) Add module dependencies.
5. Enter the file name and choose its target directory on NetSuite.
6. Press `Ctrl+Shift+P` again.
7. Choose **Add Dependency Reference to the Manifest**.
8. Create the matching XML file in the `Objects/` folder for the script deployment record.
9. Deploy the script. Example:

```xml
<clientScript scriptid="customscript_sdf_test">
    <name>CS SDF Test</name>
    <notifyowner>F</notifyowner>
    <scriptfile>[/SuiteScripts/sdf_test.js]</scriptfile>
    <scriptdeployments>
        <scriptdeployment scriptid="customdeploy_sdf_test">
            <isdeployed>T</isdeployed>
            <loglevel>DEBUG</loglevel>
            <recordtype>[customrecord_your_record]</recordtype>
            <status>RELEASED</status>
        </scriptdeployment>
    </scriptdeployments>
</clientScript>
```

10. Open `manifest.xml` and add both the targeted record type and the script file path:

```xml
<manifest projecttype="ACCOUNTCUSTOMIZATION">
    <projectname>Reference SDF</projectname>
    <frameworkversion>1.0</frameworkversion>
    <dependencies>
        <features>
            <feature required="false">CREATESUITEBUNDLES</feature>
        </features>
        <objects>
            <object>customrecord_your_record</object> <!-- Target record -->
        </objects>
        <files>
            <file>/SuiteScripts/sdf_test.js</file> <!-- File path -->
        </files>
    </dependencies>
</manifest>
```

11. Press `Ctrl+Shift+P`, then **Upload File** to push the script to the File Cabinet before deploying.

12. Press `Ctrl+Shift+P`, then choose **Deploy Project**.

## Applying roles so the script can actually run

By default a fresh deployment isn't assigned to any role, so nobody (including you, depending on your role's permissions) can trigger it. You *can* assign roles by hand in the UI, but it's more reproducible to declare them directly in the object XML:

13. Inside the `<scriptdeployment>` tag, after setting the record type:

```xml
<scriptdeployments>
    <scriptdeployment scriptid="customdeploy_sdf_test">
        <isdeployed>T</isdeployed>
        <loglevel>DEBUG</loglevel>
        <recordtype>[customrecord_your_record]</recordtype>
        <status>RELEASED</status>
        <allroles>T</allroles>        <!-- Apply to all roles -->
        <allemployees>T</allemployees> <!-- Apply to all employees -->
    </scriptdeployment>
</scriptdeployments>
```

To restrict to specific roles instead of `allroles`, use a repeated `<audience><roles><role>` block with the internal IDs of the roles you want, and drop `<allroles>T</allroles>`.

---

## Root XML tags by script type

The walkthrough above used `<clientScript>`, but every SuiteScript type has its own root tag for the object XML. Swap the tag (and nothing else in the overall structure) to deploy a different type:

| Script Type | Root XML Tag |
|---|---|
| Client Script | `<clientScript>` |
| User Event Script | `<usereventscript>` |
| Suitelet | `<suitelet>` |
| RESTlet | `<restlet>` |
| Scheduled Script | `<scheduledscript>` |
| Map/Reduce Script | `<mapreducescript>` |
| Mass Update Script | `<massupdatescript>` |
| Workflow Action Script | `<workflowactionscript>` |
| Portlet | `<portlet>` |
| Bundle Installation Script | `<bundleinstallationscript>` |

The internal structure (`scriptid`, `name`, `scriptfile`, `scriptdeployments`) stays the same across all of them — only the outer tag and any type-specific children (like `<recordtype>` on record-bound scripts, which doesn't apply to a RESTlet) change.

---

## Common gotchas

- **`suitecloud project:deploy` fails with a permissions error** — the role used by `account:setup` needs the "SuiteCloud Development Framework" permission and access to whatever record types/features your objects touch.
- **A deployed script doesn't show up under Script Deployments** — check that the object XML was actually referenced in `manifest.xml`; SDF only deploys what the manifest lists.
- **Script runs in Sandbox but not Production** — `<status>` in the deployment XML is per-environment when you deploy separately to each account; double check it's `RELEASED` (not `TESTING`) in the account you expect it to run in.
- **File Cabinet path mismatch** — the path in `<scriptfile>` is relative to `/SuiteScripts/` inside the account's File Cabinet, not your local project folder structure. If your local `FileCabinet/SuiteScripts/` has subfolders, mirror that in the `<scriptfile>` path too.

---

## Authors

[Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) – NetSuite Developer

[Kirollos Ayman](https://www.linkedin.com/in/keroloseid/) – NetSuite Developer

Feel free to connect or contribute!

Let me know if you have special focus (e.g., SuiteQL, OAuth, or CSV imports) and I'll tailor it even more!
