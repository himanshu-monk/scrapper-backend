const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs')
const path = require('path')
const Axios = require('axios')
const request = require('request-promise');
const createResumeLink = require("./download");

const scrapper = async (query, dbData) => {
    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: "ws://127.0.0.1:9222/devtools/browser/c46e06ca-0185-49e7-a3d0-d6ae17ac98d8"
            ,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        // const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://resdex.naukri.com/v2/');
        await page.setDefaultNavigationTimeout(0);
        // await page.$eval('#toggleForm > li.boxSel.sel', form => form.click());
        // await page.type('#loginEmail', 'talent@recro.io');
        // await page.type('#password', 'Recro@123');
        // await page.click('#loginBtn');
        // await page.waitForNavigation();

        // await page.evaluate(async () => {
        //     var item = document.querySelector('body > div:nth-child(10) > div > div.mainPadLR.mainPadtop.lH18.font12');
        //     console.log(item);
        //     if (!!item) {
        //         await page.click('body > div:nth-child(10) > div > div.cls.mainPadtop.tabbg.mainPadLR > a.tabUnsel');
        //         await page.click('#resetLoginRadioBtn');
        //         await page.waitForNavigation();
        //     }
        // });


        if (query.isBooleanOn) {
            await page.click('#advSrchFrm > article > div.advS > div.advSCont > div.mainSec > div:nth-child(2) > div.form-rowR > div.oh > p > a');
        }
        await page.click('#srchKeyDD');
        await page.click('#TS');
        // await page.type('#Sug_hireFor', 'Software Engineer');
        if (!query.isBooleanOn) await page.type('#Sug_advKwd', query.anyKey+'\n' || '(software OR Engineer OR Developer OR Exp OR Experience OR Industry) (node OR Nodejs) NOT (Java OR Manual OR Salesforce OR C#)\n');
        else await page.type('#Sug_advKwdBool', query.anyKey+'\n' || '(software OR Engineer OR Developer OR Exp OR Experience OR Industry) (node OR Nodejs) NOT (Java OR Manual OR Salesforce OR C#)\n');
        if (query?.allKey) {
            await page.type('#Sug_advAllKwd', query.allKey);
            await page.click('#sugDrp_advAllKwd > ul > li:nth-child(1) > div')
        }
        if (query?.excKey) {
            await page.type('#Sug_advExcKwd', query.excKey);
        }
        await page.type('#adv_minSal', query.exp.min || '1');
        await page.type('#adv_maxSal', query.exp.max || '10');
        if (query?.salary && query.salary.min1!==0 && query.salary.min2!==0 && query.salary.max1!==0 && query.salary.max2!==0) {
            await page.type('#adv_minLac', query.salary.min1, { delay: 100 })
            await page.click('#ul_ddMinLac > div > div.matchParent.content > ul > li.pickVal.active > a')
            await page.type('#adv_minTh', query.salary.min2, { delay: 100 })
            await page.click('#ul_ddMinTh > div > div.matchParent.content > ul > li.pickVal.active > a')
            await page.type('#adv_maxLac', query.salary.max1, { delay: 100 })
            await page.click('#ul_ddMaxLac > div > div.matchParent.content > ul > li.pickVal.active > a')
            await page.type('#adv_maxTh', query.salary.max2, { delay: 100 })
            await page.click('#ul_ddMaxTh > div > div.matchParent.content > ul > li.pickVal.active > a')
        }
        if (query?.curLoc) await page.type('#currentLoc', query.curLoc)
        if (query?.employment?.otherEmp?.funcArea) await page.type('#fArea', query.employment.otherEmp.funcArea)
        if (query?.employment?.otherEmp?.industry) await page.type('#industry', query.employment.otherEmp.industry)
        if (query?.employment?.employers?.company) {
            await page.type('#Sug_inlComKwd', query.employment.employers.company);
            await page.click('#sugDrp_inlComKwd > ul > li:nth-child(1) > div')
        }
        if (query?.employment?.employers.isAllTime) await page.click('#boolIncludeChk')
        if (query?.employment?.excEmployers?.company) await page.type('#Sug_excComKwd', query.employment.excEmployers.company)
        if (query?.employment?.excEmployers.isAllTime) await page.click('#boolExcludeChk')
        if (query?.employment?.designation?.designation) await page.type('#Sug_desigKwd', query.employment.designation.designation)
        if (query?.employment?.designation.isAllTime) await page.click('#boolDesigChk')
        // await page.click('#noticeDD > div.DDwrap.flatInpCont.brBotN > ul > li.tagit > span.dCross');
        //await page.click('#srchSticky > input.btn-large.btn-primary.searchBtn.btnIcon');
        // await page.type(String.fromCharCode(13))
        await page.waitForNavigation();
        // await page.click('#clstAccord > a:nth-child(4)');
        // await page.waitForSelector('#kwd');
        // await page.type('#kwd', 'Java AND (Spring OR SpringMVC OR Hibernate OR ORM) AND (SQL OR mYSQL OR Mongo OR Mongodb OR NoSQL OR Hbase OR HDFS OR Oracle OR PLSQL OR postgre)')
        // await page.click('#clstSbt');
        // await page.waitForNavigation();

        await page.waitForSelector('#firstTupCont');
        var response = await page.evaluate(async (query) => {
            var titleLinkArray = [];
            var replacer = "";
            let i = 0;
            for (var j = 0; j < query.count; j++) {
                if (i <= 9) {
                    replacer = '#firstTupCont';
                } else {
                    i = i - 9;
                    replacer = '#secTupCont';
                }
                titleLinkArray[j] = {
                    position: await j,
                    createdAt: (await new Date()).toLocaleString(),
                    name: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.clFx > a`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.clFx > a`).textContent,
                    exp: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.mtxt > span.exp`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.mtxt > span.exp`).textContent,
                    salary: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.mtxt > span.sal`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.mtxt > span.sal`).textContent,
                    location: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.mtxt > span.loc`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.mtxt > span.loc`).textContent,
                    current: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.currInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.currInfo`).textContent,
                    previous: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.prvInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.prvInfo`).textContent,
                    education: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.eduInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.eduInfo`).textContent,
                    prefLoc: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.locInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.locInfo`).textContent,
                    skills: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.prefSkill.hKwd.kSklsInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.prefSkill.hKwd.kSklsInfo`).textContent,
                    alsoKnows: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.fKwd.hKwd.myKnwInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.desc.fKwd.hKwd.myKnwInfo`).textContent,
                    active: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div > span.mr15`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div > span.mr15`).textContent,
                    modified: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div > span:nth-child(3)`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div > span:nth-child(3)`).textContent,
                    headLine: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupRight > a.resHead.name.resHdInfo`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupRight > a.resHead.name.resHdInfo`).textContent,
                    selector: `${replacer} > div:nth-child(${i + 1}) > div.tupCmtWrap > div.tupData > div.tupLeft > div.clFx > a`,
                    views: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div.ftRight > span.vwd`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div.ftRight > span.vwd`).textContent,
                    downloads: await document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div.ftRight > span.dwld`) && document.querySelector(`${replacer} > div:nth-child(${i + 1}) > div.tupleFoot > div.ftRight > span.dwld`).textContent,
                };
                i++;
            }

            var response = {
                profiles: titleLinkArray,
                totalProfiles: document.querySelector(`#sInfo > span.num`) && document.querySelector(`#sInfo > span.num`).textContent
            };
            // console.log(response, "response");
            return response;
        }, query);

        response.profiles = await filter(response.profiles);
        response.profiles = generateUID(response.profiles, dbData.length);
        // response.profiles = checkDuplicates(response.profiles, dbData);
        // return response.profiles;
        let completeProfiles = [];
        let error;
        for (var i = 0; i < response.profiles.length; i++) {
            var newPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));
            console.log(response.profiles[i].selector, "slector")
            await page.click(response.profiles[i].selector);
            var newPage = await newPagePromise;
            // await newPage.waitForNavigation();
            
            // error = await newPage.evaluate(async () => {
                //     return document.querySelector('body > div.wrap.errorPage');
                // });
                
                // if (error) {
                    //     console.log(error)
                    //     await newPage.close();
                    //     await page.close();
                    //     break;
                    // }
                    
                    await autoScroll(newPage);
                    await newPage.setRequestInterception(true);

                let resume = "";
                await newPage.waitForSelector("#cvDwldLink");
                await newPage.hover("#cvDwldLink");
                var link = await newPage.evaluate(async () => {
                    var link = await document.querySelector("#cvDwldLink").href;
                    return link;
                });
                console.log(link)
                var xRequest = await new Promise(resolve => {
                    newPage.on('request', interceptedRequest => {
                        interceptedRequest.abort();
                        resolve(interceptedRequest);
                    });
                });

                var cookies = await newPage.cookies();
                resume = await downloadResume(link, xRequest, cookies);
            completeProfiles[i] = await newPage.evaluate(async ({ response, i, resume }) => {
                return {
                    ...response.profiles[i],
                    description: await document.querySelector('#jump-about > span.content') && document.querySelector('#jump-about > span.content').textContent,
                    workSummary: await document.querySelector('#jump-experience > div.content') && document.querySelector('#jump-experience > div.content').textContent,
                    workExp: await document.querySelector('#mainCvWrap > div.btm-content-wrap > div > div.cv-details-container.tuple > div.cv-details-inner-wrap > div:nth-child(3) > div.content') && document.querySelector('#mainCvWrap > div.btm-content-wrap > div > div.cv-details-container.tuple > div.cv-details-inner-wrap > div:nth-child(3) > div.content').textContent,
                    resume,
                    other: {
                        desiredJobDetails: {
                            type: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(1) > div:nth-child(3)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(1) > div:nth-child(3)').textContent,
                            status: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(1) > div:nth-child(5)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(1) > div:nth-child(5)').textContent,
                        },
                        workAuthorization: {
                            usStatus: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(2) > div:nth-child(3)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(2) > div:nth-child(3)').textContent,
                            otherCountries: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(2) > div:nth-child(5)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.left-container > div.desired-job-container > div:nth-child(2) > div:nth-child(5)').textContent
                        }
                    },
                    personalDetails: {
                        dob: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(2)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(2)').textContent,
                        gender: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(4)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(4)').textContent,
                        maritalStatus: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(6)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(6)').textContent,
                        category: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(8)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.clFx.details-box > div:nth-child(8)').textContent,
                        address: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.address-box.mt10 > div:nth-child(2)') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.address-box.mt10 > div:nth-child(2)').textContent,
                        contact: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.address-box.mt10 > div.bkt4.phoneNo') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.address-box.mt10 > div.bkt4.phoneNo').textContent,
                        email: await document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.address-box.mt10 > div.bkt4.email') && document.querySelector('#jump-other-detail > div.content.other-detail-box.clFx > div.right-container > div > div.address-box.mt10 > div.bkt4.email').textContent
                    }
                }
            }, { response, i, resume });
            // await autoScroll(newPage);
            // setTimeout(async () => {
            // }, autoDelay());
            await newPage.close();
        }
        if (error) return {profiles: response.profiles, error: "Limit exceeded"};
        console.log(completeProfiles)
        browser.close()
        return completeProfiles;
    } catch (err) {
        console.log(err);
        return err;
    }
};

const isResume = async (page, selector) => {
    let link;
	try {
		await page.waitForSelector(selector);
		await page.hover(selector);

        link = await page.evaluate(async (selector) => {
            var link = await document.querySelector(selector).href;
            return link;
        }, selector);
		return link;
	} catch (error) {
		console.log(error, "error");
        link = ""
        return link;
	}
};

async function filter(jsonProfiles) {
    var designation = ["test", "sdet", "qa", "sqa", "quality", "testing", "manual", "automation", "admin", "administrator", "administration", "support", "devops", "recruiter", "talent", "recruitment", "sourcing", "sourcer", "android", "ios", "mobile", "professor", "lecturer", "trainer", "sap", "python", "node", "nodejs", "angular", "angularjs", "react", "reactjs", "ui", "frontend", "front end", "program", "project manager", "business analyst", "sql", "oracle", "customer", "etl", "informatica", "dwh", "sfdc", "salesforce", "congos", "bl", "business intelligence", "data", "machine learning", "bigdata"];

    var key = ["Selenium", "Cucumber", "test", "tester", "testing", "sdet", "mocha", "mockito", "qtp", "loadrunner",
        "load runner", "appium", "manual", "automation test", "automation testing", "automation tester", "regression",
        "webdriver", "web driver", "blackbox", "black box", "STLC", "SDET"];

    var key2 = ["Ios", "swift", "objectiveC", "objective C", "Iphone", "xcode", "cocoa"];

    var key3 = ["Salesforce", "sales force", "sfdc", "apex", "triggers", "visualforce", "visual force", "pega", "prpc"];

    var key4 = ["c#", ".net", "asp.net", ".netcore", ".net core", "aspnet", "ado", "adonet", "ado.net", "vbnet", "vb.net",
        "webapi", "web api"];

    let intersection = jsonProfiles.filter(x => {
        let currDes, prevDes, mergedDes;
        if (x.current === null) currDes = "";
        else currDes = x.current;
        if (x.previous === null) prevDes = "";
        else prevDes = x.previous;
        mergedDes = (currDes + " " + prevDes).toLowerCase();
        for (var i = 0; i < designation.length; i++) {
            if (mergedDes.includes(designation[i])) {
                return false;
            }
        }
        return true;
    })

    let intersection2 = await intersection.filter(x => {
        var cnt = 0;
        if (x.skills) {
            var skillArray = x.skills.split(",").map(function (item) {
                return item.trim();
            });
            for (var i = 0; i < skillArray.length; i++) {
                if (key.includes(skillArray[i])) {
                    cnt++;
                    if (cnt > 2) {
                        return false;
                    }
                }
            }
        }
        return true;
    });

    let intersection3 = await intersection2.filter(x => {
        let cnt = 0;
        if (x.skills) {
            var skillArray = x.skills.split(",").map(function (item) {
                return item.trim();
            });
            for (var i = 0; i < skillArray.length; i++) {
                if (key2.includes(skillArray[i])) {
                    cnt++;
                    if (cnt > 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    });

    let intersection4 = await intersection3.filter(x => {
        let cnt = 0;
        if (x.skills) {
            var skillArray = x.skills.split(",").map(function (item) {
                return item.trim();
            });
            for (var i = 0; i < skillArray.length; i++) {
                if (key3.includes(skillArray[i])) {
                    cnt++;
                    if (cnt > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    });

    let intersection5 = await intersection4.filter(x => {
        let cnt = 0;
        if (x.skills) {
            var skillArray = x.skills.split(",").map(function (item) {
                return item.trim();
            });
            for (var i = 0; i < skillArray.length; i++) {
                if (key4.includes(skillArray[i])) {
                    cnt++;
                    if (cnt > 2) {
                        return false;
                    }
                }
            }
        }
        return true;
    });

    return intersection5;
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}

async function autoDelay() {
    const delay = [6000, 7000, 8000, 9000, 10000];
    return delay[Math.floor(delay.length * Math.random())];
}


async function downloadResume(link, xRequest, cookies) {
    console.log(link, 1)
    var options = {
      encoding: null,
      method: xRequest._method,
      uri: link,
      body: xRequest._postData,
      headers: xRequest._headers
    }
    options.headers.Cookie = cookies.map(ck => ck.name + '=' + ck.value).join(';');
    var buf = await request(options);
    console.log(buf)
    const resumeLink = await createResumeLink(buf);
    console.log("resume saved");
    return resumeLink;
  }

// async function downloadResume(name, link, xRequest, cookies) {
//     var options = {
//         encoding: null,
//         method: xRequest._method,
//         uri: link,
//         body: xRequest._postData,
//         headers: xRequest._headers
//     }
//     options.headers.Cookie = cookies.map(ck => ck.name + '=' + ck.value).join(';');
//     var res = await request(options);

//     const dir = path.join(__dirname, "./downloads");
//     let fileName;
//     if (res[0] == 37 && res[1] == 80 && res[2] == 68 && res[3] == 70) {
//         fileName = name + '_' + (new Date()).getTime() + '.pdf';
//     } else {
//         fileName = name + '_' + (new Date()).getTime() + '.docx';
//     }
//     fs.open(`${dir}${fileName}`, 'w', (err, desc) => {
//         if (!err && desc) {
//             fs.writeFile(desc, res, (err) => {
//                 if (err) throw err;
//                 console.log('resume saved!', res[0]);
//             })
//         }
//     })
//     console.log(res);
// }

const checkDuplicates = async (data, dbData) => {
    let arr = [];
    for (let entry in data) {
        var keep = true;

        for (let c in dbData) {
            if (dbData[c].key === data[entry].key) {
                keep = false;
            }
        }
        if (keep) {
            arr.push({
                ...data[entry],
                key: data[entry].key
            })
        }
    }
    return arr;
}

const generateUID = (profiles, cnt=0) => {
    let arr = [...profiles];
    for(let i=0; i<profiles.length; i++) {
        var { name, exp, salary, location, current, previous, education, prefLoc, skills, active, headLine } = profiles[i];
        if (exp === null) exp = "";
        if (current === null) current = "";
        if (previous === null) previous = "";
        salary = salary.split("")[0];
        active = active.split(": ")[1];
        var skillsArr = skills.split(', ');
        var len = skillsArr.length - 1;
        let filteredskills = `${skillsArr[1]}_${skillsArr[2]}_${skillsArr[len - 2]}_${skillsArr[len - 1]}`;
        const id = `${name}@${exp}@${salary}@${location}@${current}@${previous}@${education}@${prefLoc}@${filteredskills}@${active}@${headLine}`;
        arr[i].key = id;
        arr[i].cnt = ++cnt;
    }
    return arr;
}
module.exports = scrapper;
