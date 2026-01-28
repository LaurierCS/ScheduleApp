import { readdir, readFile } from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

type RenderedEmail = {
    subject: string,
    html: string,
    plain: string,
}

type EmailTemplateDataMap = {
    confirmation: {
      firstName: string,
      role: string,
      date: string,
      time: string,
      isMorning: boolean,
      meetingLink: string,
      senderName: string,
      senderRole: string,
      senderOrganization: string,  
    },
    passwordReset: {
        userName: string,
        code: string,
    },
    update: {
        firstName: string,
        isCancellation: boolean,
        role: string,
        oldDate: string,
        oldTime: string,
        wasMorning: boolean,
        newDate: string,
        newTime: string,
        isMorning: boolean,
        meetingLink: string,
        senderName: string,
        senderRole: string,
        senderOrganization: string,  
    },
    welcome: {
        firstName: string,
        appName: string,
    },
}


class EmailTemplateManager {

    templateCount: number = 0;

    private constructor() {}

    /**
     * Factory method for EmailTemplateManager.
     * @returns A new instance of EmailTemplateManager
     */
    static async create(): Promise<EmailTemplateManager> {
        // registerPartials before instantiation to ready them for template compilation
        const manager = new EmailTemplateManager();
        await manager.registerPartials("./templates/partials");
        return manager;
    }

    /**
     * 
     * @param templateName a string referencing a defined template
     * @param data data needed for the template conforming to EmailTemplateDataMap
     * @returns a RenderedEmail containing a subject line, and HTML/plain text versions of the email template
     */
    async renderTemplate<T extends keyof EmailTemplateDataMap>(
        templateName: T,
        data: EmailTemplateDataMap[T]
    ): Promise<RenderedEmail> {

        const filePath = path.join(__dirname, "./templates", templateName);
        
        const [subjectSrc, htmlSrc, plainSrc] = await Promise.all([
            readFile(path.join(filePath, templateName + "_subject.hbs"), 'utf-8'),
            readFile(path.join(filePath, templateName +         ".hbs"), 'utf-8'),
            readFile(path.join(filePath, templateName +   "_plain.hbs"), 'utf-8')
        ]);

        const subject = Handlebars.compile(subjectSrc)(data);
        const html = Handlebars.compile(htmlSrc)(data);
        const plain = Handlebars.compile(plainSrc)(data);

        return {
            subject,
            html,
            plain
        }
    }

    /**
     * 
     * @param templateName a string referencing a defined template
     * @param data data needed for the template conforming to EmailTemplateDataMap
     * @returns the preview text for the given template
     */
    async previewTemplate<T extends keyof EmailTemplateDataMap>(
        templateName: T,
        data: EmailTemplateDataMap[T]
    ): Promise<string> {

        const filePath = path.join(__dirname, "./templates", templateName);
        const previewSrc = await readFile(path.join(filePath, templateName + "_preview.hbs"), "utf-8");

        return Handlebars.compile(previewSrc)(data);
    }



    /** Get a list of template names that can be used to call renderTemplate() or previewTemplate().
        Note: uses folder name as the templateName by convention.
     * 
     * @returns a list of templateName strings
     */
    async getTemplateList(): Promise<string[]> {
        const templates: string[] = [];
        const filePath = path.join(__dirname, "./templates");
        
        const files = await readdir(filePath, {withFileTypes: true});

        for (const file of files) {
            if (file.isDirectory()) {
                templates.push(file.name);
            }
        }
        this.templateCount = templates.length;
        return templates;
    }

    /**
     * Registers the partials contained in dir
     * @param dir - the relative directory containing the partials
     */
    protected async registerPartials(dir: string): Promise<void> {

        const filePath = path.join(__dirname, dir);
        const files = await readdir(filePath);

        for (const file of files) {
            console.log(filePath, dir)
            const template = await readFile(path.join(filePath, file), 'utf-8');
            const output = Handlebars.compile(template);
            const name = path.parse(file).name;
            Handlebars.registerPartial(name, output);
        }
    }
}

export default EmailTemplateManager;