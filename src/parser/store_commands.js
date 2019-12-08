function Command_Store(register_left, shift, base_register)
{
	Command.call(this);
	Command_Memory.call(this, register_left, shift, base_register);
	this.execute = function(state)
	{
		state.memory[this.address] = state.registers[this.register_left];
		state.source = this.register_left;
		state.tar = this.address;
		state.result = state.memory[this.address];
		state.value_defined_memory[this.address] = 2;
		return state;
	}
}

function Command_Load(register_left, shift, base_register)
{
	Command.call(this);
	Command_Memory.call(this, register_left, shift, base_register);
	this.execute = function(state)
	{
		state.registers[register_left] = state.memory[this.address];
		state.tar = this.register_left;
		state.source = this.address;
		state.result = state.memory[this.address];
		state.value_defined_registers[this.register_left] = 2;
		return state;
	}
}

function Command_Load_Register(register_left, register_right)
{
	Command.call(this);
	Command_Register.call(this, register_left, register_right);
	this.execute = function(state)
	{
		state.registers[this.register_left] = state.registers[this.register_right];
		state.source = this.register_left;
		state.tar = this.register_right;
		state.result = state.registers[this.register_right];
		state.value_defined_registers[this.register_left] = 2;
		return state;
	}
}

function Command_Load_Address(register_left, shift, base_register)
{
	Command.call(this);
	Command_Memory.call(this, register_left, shift, base_register);
	this.execute = function(state)
	{
		state.registers[this.register_left] = this.address * 4;
		state.tar = this.register_left;
		state.source = this.shift;
		state.result = this.address * 4;
		state.value_defined_registers[this.register_left] = 2;
		return state;
	}
}