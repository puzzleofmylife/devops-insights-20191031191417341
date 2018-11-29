import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthState } from 'src/app/models/AuthState';
import { Psychologist } from 'src/app/models/Psychologist';
import { AuthService } from './../../services/auth.service';
import { PsychoService } from './../../services/psycho.service';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
	selector: 'app-psychologist',
	templateUrl: './psychologist.component.html',
	styleUrls: ['./psychologist.component.css']
})
export class PsychologistComponent implements OnInit {

	psychologist: Psychologist = new Psychologist();
	loggedIn: AuthState = new AuthState();
	loaded: Boolean = false;

	//Approve and Deny fields
	showApproveDenyPrompt: boolean = false;
	approve: boolean = false;
	denyMessage: string;
	denyReasonRequired: boolean = false;
	approvalError: boolean = false;

	constructor(private authService: AuthService, private psychoService: PsychoService, private route: ActivatedRoute, private helpersService: HelpersService) { }

	ngOnInit() {

		this.authService.authState().subscribe(x => this.loggedIn = x);

		const id = +(this.route.snapshot.params["id"]);
		this.psychoService.getById(id).subscribe((psychologist) => {
			this.psychologist = psychologist;
			this.psychologist.attachments = this.psychologist.attachments.filter(x => x.typeId != 2);
			this.loaded = true;
		});

	}

	getAttachmentDisplayName(attachment: any): string{
		var attachmentDisplayName = attachment.type + '.' + attachment.fileName.split('.')[1];
		return attachmentDisplayName;
	}

	downloadAttachment(attachmentId: number) {
		this.psychoService.getAttachmentById(attachmentId).subscribe(x => {
			window.open(x.fileUrl);
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	//Approve and Deny functions
	doApproval(approve: boolean) {
		this.showApproveDenyPrompt = true;
		this.approve = approve;
	}

	cancelApproval() {
		this.showApproveDenyPrompt = false;
	}

	proceedApproval() {
		if(!this.approve){
			if(!this.denyMessage){
				this.denyReasonRequired = true;
				return;
			}
		}

		this.psychoService.approveDeny(this.psychologist.id, this.approve, this.denyMessage).subscribe(x => {
			this.psychologist.status = x.name;
			this.psychologist.statusId = x.id;
			this.showApproveDenyPrompt = false;
		}, error => {
			this.approvalError = true;
			console.log(JSON.stringify(error));
		});
	}
}
